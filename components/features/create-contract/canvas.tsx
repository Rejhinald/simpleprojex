"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDrop } from "react-dnd";
import { v4 as uuidv4 } from "uuid";
import { Element, PageSize, Position, TextFormatting } from "./utils/types";
import { ElementRenderer } from "./element-renderer";
import { getPageDimensions } from "./utils/page-sizes";
import { PageMargins } from "./margin-controls";
import { Printer } from "lucide-react";
import { PrintPreview } from "./print-preview";

// Define DragItem interface to avoid 'any' types
interface DragItem {
  id?: string;
  type: string;
  isFloating?: boolean;
  isMoving?: boolean;
  position?: Position;
  content?: any;
  preview?: {
    icon?: React.ReactNode;
    label?: string;
  };
}

interface CanvasProps {
  pageSize: PageSize;
  pageMargins: PageMargins;
  elements?: Element[];
  onElementsChange?: (elements: Element[]) => void;
  activeElementId?: string | null;
  onElementFocus?: (elementId: string | null) => void;
  currentPage: number; // Required currentPage prop
}

// Local storage key for saving element positions
const ELEMENTS_STORAGE_KEY = "contract_canvas_elements";

export const Canvas = ({ 
  pageSize,
  pageMargins,
  elements: externalElements,
  onElementsChange,
  activeElementId,
  onElementFocus,
  currentPage
}: CanvasProps) => {
  // Use local state if no external elements are provided
  const [localElements, setLocalElements] = useState<Element[]>([]);
  
  // Determine which elements state to use
  const allElements = externalElements !== undefined ? externalElements : localElements;
  
  // Filter elements to only show those on the current page
  const elements = allElements.filter(el => el.pageNumber === currentPage || !el.pageNumber);
  const setElements = useCallback((newElements: Element[] | ((prev: Element[]) => Element[])) => {
    if (onElementsChange && externalElements !== undefined) {
      if (typeof newElements === 'function') {
        onElementsChange(newElements(externalElements));
      } else {
        onElementsChange(newElements);
      }
    } else {
      if (typeof newElements === 'function') {
        setLocalElements(prev => {
          const updated = newElements(prev);
          // Save to local storage whenever elements are updated
          localStorage.setItem(ELEMENTS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      } else {
        setLocalElements(newElements);
        // Save to local storage whenever elements are updated
        localStorage.setItem(ELEMENTS_STORAGE_KEY, JSON.stringify(newElements));
      }
    }
  }, [externalElements, onElementsChange]);

  // Load elements from local storage on component mount
  useEffect(() => {
    // Only load from local storage if not using external elements
    if (externalElements === undefined) {
      const savedElements = localStorage.getItem(ELEMENTS_STORAGE_KEY);
      if (savedElements) {
        try {
          const parsed = JSON.parse(savedElements);
          setLocalElements(parsed);
        } catch (error) {
          console.error("Failed to parse saved elements:", error);
        }
      }
    }
  }, [externalElements]);

  // Canvas ref for drop calculations
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Track preview during drag
  const [dropPreview, setDropPreview] = useState<{
    position: Position;
    type: string;
    isFloating?: boolean;
    icon?: React.ReactNode;
    label?: string;
  } | null>(null);
  
  // Track elements that need to move during drag
  const [elementsToMove, setElementsToMove] = useState<{
    id: string;
    targetPosition: Position;
    originalPosition: Position;
  }[]>([]);
  
  // State to track the height of each element
  const [elementHeights, setElementHeights] = useState<Record<string, number>>({});
  
  // Show print preview modal
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  // Get page dimensions based on page size
  const { width, height: pageHeight } = getPageDimensions(pageSize);
  
  // Define standard row height and horizontal padding
  const rowHeight = 40;
  const horizontalPadding = 40;

  // Update element height in the cache
  const handleElementHeightChange = useCallback((id: string, height: number) => {
    setElementHeights(prev => ({
      ...prev,
      [id]: height
    }));
  }, []);
  
  // Get the height of an element from the cache or estimate it
  const getElementHeight = useCallback((element: Element | string) => {
    const elementId = typeof element === 'string' ? element : element.id;
    const elementObj = typeof element === 'string' ? elements.find(e => e.id === element) : element;
    
    if (elementHeights[elementId]) {
      return elementHeights[elementId];
    }
    
    if (!elementObj) return rowHeight;
    
    // Provide fallback heights based on element type
    switch(elementObj.type) {
      case 'header':
        return elementObj.content.level === 1 ? 60 : (elementObj.content.level === 2 ? 50 : 40);
      case 'text':
        // Estimate based on text length
        const textLength = elementObj.content.text.length;
        const estimatedLines = Math.max(1, Math.ceil(textLength / 80));
        return estimatedLines * 24 + 20; // Add padding
      case 'bulletList':
      case 'numberList':
        return elementObj.content.items.length * 30;
      case 'table':
        return elementObj.content.rows * 40;
      case 'signature':
        return 80;
      default:
        return rowHeight;
    }
  }, [elementHeights, rowHeight, elements]);

  // Find the next available position to place a new element (avoiding overlaps)
  const findNextAvailablePosition = useCallback((type: string, isFloating?: boolean) => {
    if (isFloating) {
      // For floating elements, return a position in the center that's within canvas bounds
      return {
        x: Math.min(Math.max(width / 2 - 75, pageMargins.left), width - pageMargins.right - 350),
        y: Math.min(Math.max(pageHeight / 2, pageMargins.top), pageHeight - pageMargins.bottom - 80)
      };
    }
    
    // For regular elements, find the next available row
    if (elements.length === 0) {
      return { x: horizontalPadding, y: pageMargins.top }; // Add top margin to the initial Y position
    }
    
    // Find the lowest y position (bottom of the canvas content)
    // Only consider elements on the current page
    const regularElements = elements.filter(el => !el.isFloating && (el.pageNumber === currentPage || !el.pageNumber));
    if (regularElements.length === 0) {
      return { x: horizontalPadding, y: pageMargins.top }; // Add top margin to the initial Y position
    }
    
    // Organize elements by vertical position
    const sortedElements = [...regularElements].sort((a, b) => 
      a.position.y - b.position.y
    );
    
    // Find the highest Y position + height
    let highestY = 0;
    for (const el of sortedElements) {
      const elHeight = getElementHeight(el);
      const elBottom = el.position.y + elHeight;
      highestY = Math.max(highestY, elBottom);
    }
    
    // Add minimal spacing
    return { 
      x: horizontalPadding,
      y: highestY + 5  // Reduced from 10px to 5px spacing between elements for more compact layout
    };
  }, [elements, horizontalPadding, pageMargins.top, getElementHeight, width, pageHeight, pageMargins]);

  // Handle element move events (triggered from ElementRenderer)
  useEffect(() => {
    const handleElementMoved = (e: CustomEvent) => {
      const { id, position, height } = e.detail;
      
      if (id && position && height) {
        // Create a copy of the elements array to work with
        const newElements = [...elements];
        
        // Find the element that was moved
        const movedElementIndex = newElements.findIndex(el => el.id === id);
        if (movedElementIndex === -1) return; // Element not found
        
        const movedElement = newElements[movedElementIndex];
        
        // Skip if floating element (they're handled differently)
        if (movedElement.isFloating) return;
        
        // Find elements that need to be repositioned to avoid overlap
        const elementsToAdjust = newElements.filter(el => 
          el.id !== id && 
          !el.isFloating && 
          el.position.y >= position.y && 
          el.position.y < position.y + height
        );
        
        // Adjust positions for affected elements
        elementsToAdjust.forEach(el => {
          const index = newElements.findIndex(item => item.id === el.id);
          if (index !== -1) {
            newElements[index] = {
              ...el,
              position: {
                ...el.position,
                y: position.y + height + 10 // Add some margin
              }
            };
          }
        });
        
        // Update the elements array
        if (onElementsChange) {
          onElementsChange(newElements);
        } else {
          setLocalElements(newElements);
        }
      }
    };
    
    // Add event listener to canvas
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('elementmoved', handleElementMoved as EventListener);
    }
    
    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('elementmoved', handleElementMoved as EventListener);
      }
    };
  }, [elements, onElementsChange, setLocalElements]);

  // Handle canvas click to clear focus
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only clear focus if clicking directly on the canvas, not on elements
    if (e.target === canvasRef.current && onElementFocus) {
      onElementFocus(null);
    }
  }, [onElementFocus]);

  // Handle element focus
  const handleElementFocus = useCallback((elementId: string) => {
    if (onElementFocus) {
      onElementFocus(elementId);
    }
  }, [onElementFocus]);

  const handleDeleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    
    // Also remove from height cache
    setElementHeights(prev => {
      const newHeights = {...prev};
      delete newHeights[id];
      return newHeights;
    });
    
    // Clear focus when deleting an element
    if (onElementFocus) {
      onElementFocus(null);
    }
  }, [onElementFocus, setElements]);

  // Update element position
  const updateElementPosition = useCallback((id: string, position: Position) => {
    setElements(prev => prev.map(el => {
      if (el.id === id) {
        // For floating elements, ensure they stay within canvas boundaries
        if (el.isFloating) {
          // Calculate the element's width and height
          const elWidth = el.type === "signature" ? 350 : 200;
          const elHeight = getElementHeight(el);
          
          // Constrain position to canvas margins
          const constrainedX = Math.max(
            pageMargins.left, 
            Math.min(position.x, width - pageMargins.right - elWidth)
          );
          
          const constrainedY = Math.max(
            pageMargins.top, 
            Math.min(position.y, pageHeight - pageMargins.bottom - elHeight)
          );
          
          return { 
            ...el, 
            position: { 
              x: constrainedX, 
              y: constrainedY
            } 
          };
        }
        
        // For regular elements, just update the position
        return { ...el, position };
      }
      return el;
    }));
  }, [setElements, getElementHeight, width, pageHeight, pageMargins]);

  // Update element content
  const updateElementContent = useCallback((id: string, content: any) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, content } : el))
    );
  }, [setElements]);

  // Update element formatting
  const updateElementFormatting = useCallback((id: string, formatting: TextFormatting) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, formatting } : el))
    );
  }, [setElements]);

  // Render the drop preview based on element type
  const renderDropPreview = () => {
    if (!dropPreview || !isOver || !canDrop) return null;
    
    const previewStyle = {
      position: 'absolute',
      left: `${dropPreview.position.x}px`,
      top: `${dropPreview.position.y}px`,
      zIndex: 1000,
      opacity: 0.9,
      pointerEvents: 'none',
      transition: 'all 0.15s ease-out', // Faster transition for snappier feeling
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)', // Enhanced shadow for better visibility
    } as React.CSSProperties;
    
    // Different preview styling based on element type
    if (dropPreview.isFloating) {
      // Floating element preview (like signature)
      return (
        <div 
          style={previewStyle}
          className="border-2 border-dashed border-blue-500 bg-blue-50/80 p-4 rounded-md animate-pulse"
        >
          <div className="flex flex-col items-center">
            {dropPreview.icon && <div className="text-blue-500 mb-1">{dropPreview.icon}</div>}
            <span className="text-sm font-medium text-blue-700">{dropPreview.label || 'Signature'}</span>
          </div>
        </div>
      );
    } else {
      // Regular element preview (full width)
      return (
        <>
          {/* Enhanced insertion indicator line with animated pulse */}
          <div 
            style={{
              position: 'absolute',
              left: `${pageMargins.left}px`,
              top: `${dropPreview.position.y - 2}px`,
              width: `${width - (pageMargins.left + pageMargins.right)}px`,
              height: '4px',
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderRadius: '2px',
              zIndex: 999,
              pointerEvents: 'none',
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)', // Glow effect
            }}
          />
          
          {/* Element preview */}
          <div 
            style={{
              ...previewStyle,
              width: `${width - (horizontalPadding * 2)}px`,
              height: `${rowHeight}px`,
            }}
            className="border-2 border-dashed border-blue-500 bg-blue-50/80 rounded-md flex items-center px-3 animate-pulse"
          >
            {dropPreview.icon && <span className="mr-2 text-blue-500">{dropPreview.icon}</span>}
            <span className="font-medium text-blue-700">{dropPreview.label || dropPreview.type}</span>
          </div>
        </>
      );
    }
  };

  // Improved reorderElements function to handle overlapping elements properly
  const reorderElements = useCallback((draggedId: string, newY: number) => {
    // First, separate the element being moved from the rest
    const draggedElement = elements.find(el => el.id === draggedId);
    if (!draggedElement || draggedElement.isFloating) return;
  
    // Separate floating and regular elements
    const floatingElements = elements.filter(el => el.isFloating);
    const regularElements = elements.filter(el => !el.isFloating && el.id !== draggedId);
    
    // Create a copy with the dragged element at the exact position user dropped it
    const updatedDraggedElement = {
      ...draggedElement,
      position: {
        ...draggedElement.position,
        x: horizontalPadding,
        y: Math.max(newY, pageMargins.top)  // Ensure it's not above the top margin
      }
    };
    
    // Sort regular elements by vertical position for sequential processing
    const sortedElements = [...regularElements].sort((a, b) => a.position.y - b.position.y);
    
    // Add the dragged element to the sorted array
    const newElements = [...sortedElements];
    
    // Get the height of the dragged element
    const draggedHeight = getElementHeight(updatedDraggedElement);
    
    // Find elements that would be overlapped by the dragged element
    const overlappedElements = sortedElements.filter(el => 
      !el.isFloating && 
      ((el.position.y >= newY && el.position.y < newY + draggedHeight) ||
       (newY >= el.position.y && newY < el.position.y + getElementHeight(el)))
    );
    
    // If there are overlapping elements, shift them down
    if (overlappedElements.length > 0) {
      // Element is being dropped in a position that would cause overlap
      // Find all elements that need to be moved down
      const elementsToShift = sortedElements.filter(el => 
        el.position.y >= overlappedElements[0].position.y && el.id !== draggedId
      );
      
      // Update positions for all elements that need to shift
      elementsToShift.forEach(el => {
        const idx = newElements.findIndex(e => e.id === el.id);
        if (idx !== -1) {
          newElements[idx] = {
            ...el,
            position: {
              ...el.position,
              y: newY + draggedHeight + 5 // Reduced from 10px to 5px for more compact layout
            }
          };
        }
      });
    }
    
    // Add the dragged element to the new elements array
    newElements.push(updatedDraggedElement);
    
    // Set the new state with updated elements plus floating elements
    setElements([...newElements, ...floatingElements]);
  }, [elements, horizontalPadding, getElementHeight, setElements, pageMargins.top]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ["ELEMENT", "FLOATING_ELEMENT", "MOVE_ELEMENT", "MOVE_FLOATING_ELEMENT"],
    
    hover: (item: DragItem, monitor) => {
      if (!canvasRef.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;
      
      // Account for the canvas scaling (0.75) when calculating positions
      const scaleCompensation = 1 / 0.75; // Inverse of scale to compensate
      
      // Calculate position relative to the scaled canvas
      const position: Position = {
        x: (clientOffset.x - canvasRect.left) * scaleCompensation,
        y: (clientOffset.y - canvasRect.top) * scaleCompensation,
      };
      
      // For regular elements, snap to rows but keep exact cursor position for preview
      if (!item.isFloating) {
        position.x = horizontalPadding;
        // Enforce top margin constraint
        position.y = Math.max(position.y, pageMargins.top);
        
        // Calculate which elements would need to move to accommodate this element
        const draggedHeight = item.id ? getElementHeight(item.id) : rowHeight;
        
        // Find elements that would be overlapped by the dragged element - only consider elements on current page
        const overlappedElements = elements.filter(el => {
          if (el.isFloating || (item.id && el.id === item.id)) return false;
          if (el.pageNumber && el.pageNumber !== currentPage) return false;
          
          const elHeight = getElementHeight(el);
          return (position.y >= el.position.y && position.y < el.position.y + elHeight) ||
                 (el.position.y >= position.y && el.position.y < position.y + draggedHeight);
        });
        
        if (overlappedElements.length > 0) {
          // Sort elements by vertical position
          const sortedElements = [...elements]
            .filter(el => !el.isFloating && (!item.id || el.id !== item.id))
            .sort((a, b) => a.position.y - b.position.y);
          
          // Find the first element that needs to move
          const firstOverlappedIndex = sortedElements.findIndex(el => 
            overlappedElements.some(oe => oe.id === el.id)
          );
          
          if (firstOverlappedIndex !== -1) {
            // Calculate new positions for elements that need to move
            const elementsToShift = sortedElements.slice(firstOverlappedIndex);
            const newTargetY = position.y + draggedHeight + 5; // 5px spacing
            
            // Create animation targets for elements that need to move
            const moveTargets = elementsToShift.map(el => ({
              id: el.id,
              originalPosition: { ...el.position },
              targetPosition: { 
                x: el.position.x,
                y: newTargetY + elementsToShift.indexOf(el) * (getElementHeight(el) + 5)
              }
            }));
            
            // Update state to trigger animations
            setElementsToMove(moveTargets);
          } else {
            setElementsToMove([]);
          }
        } else {
          setElementsToMove([]);
        }
      } else {
        // Constrain floating elements within page margins
        const elWidth = item.type === "signature" ? 350 : 200;
        const elHeight = 80; // Default height for floating elements
        
        position.x = Math.max(
          pageMargins.left, 
          Math.min(position.x, width - pageMargins.right - elWidth)
        );
        position.y = Math.max(
          pageMargins.top, 
          Math.min(position.y, pageHeight - pageMargins.bottom - elHeight)
        );
        
        // Clear any movement animations for floating elements
        setElementsToMove([]);
      }
      
      // Update the drop preview
      setDropPreview({
        position,
        type: item.type,
        isFloating: item.isFloating,
        icon: item.preview?.icon,
        label: item.preview?.label
      });
    },
    
    drop: (item: DragItem, monitor) => {
      setDropPreview(null); // Clear preview when dropped
      setElementsToMove([]); // Reset element movement animations
      
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const dropOffset = monitor.getClientOffset();
      if (!dropOffset) return;

      // Compensate for the canvas scaling
      const scaleCompensation = 1 / 0.75;
      
      let position: Position = {
        x: (dropOffset.x - canvasRect.left) * scaleCompensation,
        y: (dropOffset.y - canvasRect.top) * scaleCompensation,
      };

      // Ensure position is within the canvas margins
      position.y = Math.max(pageMargins.top, position.y);
      position.x = Math.max(pageMargins.left, position.x);

      // CASE 1: Moving an existing element (item.isMoving is true)
      if (item.isMoving && item.id) {
        console.log("Moving existing element:", item.id, "to position:", position);
        
        if (item.isFloating) {
          // For floating elements (signatures), keep them within the visible area
          updateElementPosition(item.id, {
            x: Math.max(pageMargins.left, Math.min(position.x, width - pageMargins.right - 350)),
            y: Math.max(pageMargins.top, Math.min(position.y, pageHeight - pageMargins.bottom - 80))
          });
        } else {
          // For regular elements, snap to row grid
          const snappedY = Math.floor(position.y / rowHeight) * rowHeight;
          // Ensure it's at least at the top margin
          const finalY = Math.max(snappedY, pageMargins.top);
          
          // Re-order elements to handle overlap
          reorderElements(item.id, finalY);
        }
      } 
      // CASE 2: Adding a new element from the toolbar
      else {
        console.log("Adding new element of type:", item.type);
        
        if (!item.isFloating) {
          // For regular elements, use next available position without overlap
          const snappedY = Math.floor(position.y / rowHeight) * rowHeight;
          position = { 
            x: horizontalPadding, 
            y: Math.max(snappedY, pageMargins.top)
          };
          
          // Find any overlapping elements at this position
          const overlappingElements = elements.filter(el => {
            if (el.isFloating) return false; // Ignore floating elements
            
            // Check if the new element would overlap with this one
            const elHeight = getElementHeight(el);
            return (position.y >= el.position.y && position.y < el.position.y + elHeight) ||
                   (el.position.y >= position.y && el.position.y < position.y + rowHeight);
          });
          
          // If there's an overlap, find the next available position
          if (overlappingElements.length > 0) {
            position = findNextAvailablePosition(item.type, item.isFloating);
          }
        } else {
          // For floating elements (signatures), constrain within bounds
          const elWidth = item.type === "signature" ? 350 : 200;
          position = {
            x: Math.min(position.x, width - pageMargins.right - elWidth),
            y: Math.min(position.y, pageHeight - pageMargins.bottom - 80)
          };
        }
        
        // Create new element at the determined position and assign it to the current page
        createNewElement(item.type, position, item.isFloating);
      }
      
      return { id: item.id }; // Return a result to indicate successful drop
    },
    
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [elements, rowHeight, width, pageHeight, reorderElements, findNextAvailablePosition, 
       horizontalPadding, pageMargins, updateElementPosition, getElementHeight, currentPage]);

  // Clear preview and animations when not hovering
  useEffect(() => {
    if (!isOver) {
      setDropPreview(null);
      setElementsToMove([]);
    }
  }, [isOver]);

  const createNewElement = useCallback((type: string, position: Position, isFloating?: boolean) => {
    const id = uuidv4();
    const defaultFormatting: TextFormatting = {
      fontSize: type === 'header' ? 24 : 16,
      alignment: 'left'
    };
    
    // Create element based on type
    switch (type) {
      case "header":
        setElements(prev => [...prev, {
          id,
          type: "header",
          isFloating,
          position,
          content: {
            text: "New Header",
            level: 1
          },
          formatting: defaultFormatting,
          pageNumber: currentPage, // Assign current page number
        }]);
        break;
      case "text":
        setElements(prev => [...prev, {
          id,
          type: "text",
          isFloating,
          position,
          content: {
            text: "Enter your text here..."
          },
          formatting: defaultFormatting,
          pageNumber: currentPage, // Assign current page number
        }]);
        break;
      case "bulletList":
        setElements(prev => [...prev, {
          id,
          type: "bulletList",
          isFloating,
          position,
          content: {
            items: [
              { id: uuidv4(), text: "Item 1" },
              { id: uuidv4(), text: "Item 2" },
              { id: uuidv4(), text: "Item 3" }
            ]
          },
          formatting: defaultFormatting,
          pageNumber: currentPage, // Assign current page number
        }]);
        break;
      case "numberList":
        setElements(prev => [...prev, {
          id,
          type: "numberList",
          isFloating,
          position,
          content: {
            items: [
              { id: uuidv4(), text: "Item 1" },
              { id: uuidv4(), text: "Item 2" },
              { id: uuidv4(), text: "Item 3" }
            ]
          },
          formatting: defaultFormatting,
          pageNumber: currentPage, // Assign current page number
        }]);
        break;
      case "table":
        setElements(prev => [...prev, {
          id,
          type: "table",
          isFloating,
          position,
          content: {
            rows: 3,
            cols: 3,
            data: [
              ['Header 1', 'Header 2', 'Header 3'],
              ['Cell 1', 'Cell 2', 'Cell 3'],
              ['Cell 4', 'Cell 5', 'Cell 6']
            ]
          },
          formatting: defaultFormatting,
          pageNumber: currentPage, // Assign current page number
        }]);
        break;
      case "signature":
        setElements(prev => [...prev, {
          id,
          type: "signature",
          isFloating: true, // Force floating for signatures
          position,
          content: {
            label: "Signature",
            initials: false,
            signatureType: "signature"
          },
          formatting: defaultFormatting,
          pageNumber: currentPage, // Assign current page number
        }]);
        break;
    }
    
    // Focus the new element after a short delay to allow rendering
    if (onElementFocus) {
      setTimeout(() => onElementFocus(id), 100);
    }
  }, [setElements, onElementFocus, currentPage]);

  // Filter elements for the current page before rendering
  const currentPageElements = elements.filter(el => el.pageNumber === currentPage || !el.pageNumber);
  
  // Get the rendered elements ordered by vertical position
  const renderedElements = [...currentPageElements].sort((a, b) => {
    // Sort by vertical position for non-floating elements
    if (!a.isFloating && !b.isFloating) {
      return a.position.y - b.position.y;
    }
    // Floating elements come last
    if (a.isFloating && !b.isFloating) return 1;
    if (!a.isFloating && b.isFloating) return -1;
    return 0;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Print Preview Button */}
      <div className="flex justify-end pr-4 mb-2">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          onClick={() => setShowPrintPreview(true)}
        >
          <Printer className="w-4 h-4" />
          <span>Preview</span>
        </button>
      </div>
      
      {/* Canvas area with drop target */}
      <div 
        className="flex-1 overflow-auto"
        onClick={handleCanvasClick}
      >
        <div 
          ref={node => {
            drop(node);
            canvasRef.current = node;
          }}
          className="relative mx-auto bg-white rounded-lg shadow border-2 border-gray-200 overflow-hidden scale-75 origin-top" 
          style={{ 
            width: `${width}px`,
            height: `${pageHeight}px`,
            transition: 'all 0.2s ease',
            minHeight: '1000px'
          }}
        >
          {/* Visualize page margins */}
          <div 
            className="absolute border border-dashed border-gray-300 pointer-events-none" 
            style={{
              top: `${pageMargins.top}px`,
              left: `${pageMargins.left}px`,
              right: `${pageMargins.right}px`,
              bottom: `${pageMargins.bottom}px`,
              width: `${width - (pageMargins.left + pageMargins.right)}px`,
              height: `${pageHeight - (pageMargins.top + pageMargins.bottom)}px`,
            }}
          />

          {/* Render elements */}
          {renderedElements.map(element => {
            // Find if this element has a movement animation
            const moveAnimation = elementsToMove.find(move => move.id === element.id);
            
            // Calculate the style for animation
            const animationStyle = moveAnimation ? {
              transform: `translateY(${moveAnimation.targetPosition.y - moveAnimation.originalPosition.y}px)`,
              transition: 'transform 0.3s ease-out'
            } : {};
            
            return (
              <div key={element.id} style={animationStyle}>
                <ElementRenderer
                  element={element}
                  canvasWidth={width}
                  horizontalPadding={horizontalPadding}
                  topMargin={pageMargins.top} 
                  onDelete={() => handleDeleteElement(element.id)}
                  onPositionChange={(position) => updateElementPosition(element.id, position)}
                  onContentChange={(content) => updateElementContent(element.id, content)}
                  onHeightChange={(height) => handleElementHeightChange(element.id, height)}
                  onFormattingChange={(formatting) => updateElementFormatting(element.id, formatting)}
                  isActive={element.id === activeElementId}
                  onFocus={() => handleElementFocus(element.id)}
                />
              </div>
            );
          })}

          {/* Render drop preview */}
          {renderDropPreview()}
        </div>
      </div>

      {/* Print preview modal */}
      {showPrintPreview && (
        <PrintPreview
          elements={allElements} // Pass ALL elements instead of just current page elements
          pageSize={pageSize}
          pageMargins={pageMargins}
          onClose={() => setShowPrintPreview(false)}
          allPages={Math.max(1, ...allElements.map(el => el.pageNumber || 1))} // Calculate max page number, ensuring at least 1 page
        />
      )}
    </div>
  );
};