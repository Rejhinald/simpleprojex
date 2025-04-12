"use client";

import { useRef, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { X, GripVertical } from "lucide-react";
import { Element, Position, TextFormatting } from "./utils/types";
import { HeaderElement } from "./elements/header-element";
import { TextElement } from "./elements/text-element";
import { BulletListElement } from "./elements/bullet-list-element";
import { NumberListElement } from "./elements/number-list-element";
import { TableElement } from "./elements/table-element";
import { SignatureElement } from "./elements/signature-element";

interface ElementRendererProps {
  element: Element;
  canvasWidth: number;
  horizontalPadding: number;
  onDelete: (id: string) => void;
  onPositionChange: (position: Position) => void;
  onContentChange: (content: any) => void;
  onHeightChange: (height: number) => void;
  onFormattingChange?: (formatting: TextFormatting) => void;
  isActive?: boolean;
  onFocus?: () => void;
  topMargin?: number;
  isPrintPreview?: boolean;
}

export const ElementRenderer = ({
  element,
  canvasWidth,
  horizontalPadding,
  topMargin = 0,
  onDelete,
  onPositionChange,
  onContentChange,
  onHeightChange,
  onFormattingChange,
  isActive = false,
  onFocus,
  isPrintPreview = false,
}: ElementRendererProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [elementHeight, setElementHeight] = useState(0);

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: element.isFloating ? "MOVE_FLOATING_ELEMENT" : "MOVE_ELEMENT",
    item: () => ({
      id: element.id,
      type: element.type,
      isFloating: element.isFloating,
      isMoving: true,
      position: { ...element.position },
      content: element.content
    }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        console.log("Drag ended without valid drop - element remains at original position");
      }
    }
  }), [element.id, element.position, element.content, element.type, element.isFloating]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!element.isFloating || !elementRef.current) return;

    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const elementX = element.position.x;
    const elementY = element.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      onPositionChange({
        x: elementX + dx,
        y: elementY + dy,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (element.isFloating && elementRef.current) {
      dragRef(elementRef.current);
    }
  }, [dragRef, element.isFloating]);

  useEffect(() => {
    if (!elementRef.current) return;
    
    const observer = new ResizeObserver(entries => {
      const height = entries[0].contentRect.height;
      setElementHeight(height);
      onHeightChange(height);
      
      const event = new CustomEvent('elementresized', { 
        bubbles: true,
        detail: { id: element.id, height }
      });
      elementRef.current?.dispatchEvent(event);
    });
    
    observer.observe(elementRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [element.id, onHeightChange]);

  useEffect(() => {
    if (!element.isFloating && elementRef.current) {
      const event = new CustomEvent('elementmoved', { 
        bubbles: true,
        detail: { 
          id: element.id, 
          position: element.position,
          height: elementHeight
        }
      });
      elementRef.current.dispatchEvent(event);
    }
  }, [element.position, elementHeight, element.id, element.isFloating]);

  const handleElementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFocus) {
      onFocus();
    }
  };

  const renderElement = () => {
    const contentWidth = canvasWidth - (horizontalPadding * 2);
    
    switch (element.type) {
      case "header":
        return (
          <HeaderElement 
            content={element.content} 
            onChange={onContentChange} 
            formatting={element.formatting}
            onFormattingChange={onFormattingChange}
            isPrintPreview={isPrintPreview}
          />
        );
      case "text":
        return (
          <TextElement 
            content={element.content} 
            onChange={onContentChange} 
            formatting={element.formatting}
            onFormattingChange={onFormattingChange}
            isPrintPreview={isPrintPreview}
          />
        );
      case "bulletList":
        return (
          <BulletListElement 
            content={element.content} 
            onChange={onContentChange}
            formatting={element.formatting}
            onFormattingChange={onFormattingChange}
            isPrintPreview={isPrintPreview}
          />
        );
      case "numberList":
        return (
          <NumberListElement 
            content={element.content} 
            onChange={onContentChange}
            formatting={element.formatting}
            onFormattingChange={onFormattingChange}
            isPrintPreview={isPrintPreview}
          />
        );
      case "table":
        return (
          <TableElement 
            content={element.content} 
            onChange={onContentChange}
            formatting={element.formatting}
            onFormattingChange={onFormattingChange}
            contentWidth={contentWidth}
            isPrintPreview={isPrintPreview}
          />
        );
      case "signature":
        const signatureContent = {
          ...element.content,
          signatureType: (element.content as any).signatureType || 'initials',
          label: element.content.label || 'Signature',
          initials: (element.content as any).initials || '',
          imageData: element.content.imageData
        };
        return (
          <SignatureElement 
            content={signatureContent} 
            onChange={onContentChange}
            isPrintPreview={isPrintPreview}
          />
        );
      default:
        return <div>Unknown element type: {element.type}</div>;
    }
  };

  const containerClassName = isPrintPreview
    ? "relative"
    : `relative group ${element.isFloating 
        ? "border-2 border-dashed border-blue-300 bg-blue-50 rounded" 
        : isActive 
        ? "bg-blue-50 border border-blue-300 rounded" 
        : "hover:bg-gray-50"}`;

  const adjustPositionForMargins = (position: Position): Position => {
    if (!element.isFloating) {
      return {
        x: position.x,
        y: Math.max(position.y, topMargin)
      };
    }
    return position;
  };

  return (
    <div
      ref={elementRef}
      className={`absolute transition-all ${element.isFloating ? "cursor-move" : ""} ${isDragging ? "opacity-30" : "opacity-100"}`}
      style={{
        left: `${element.position.x}px`,
        top: `${Math.max(element.position.y, element.isFloating ? 0 : topMargin)}px`,
        width: element.isFloating 
          ? element.type === "signature" ? "300px" : "auto"
          : `${canvasWidth - (horizontalPadding * 2)}px`,
        zIndex: isActive ? 5 : element.isFloating ? 10 : 1,
        transform: isDragging && !element.isFloating ? "translateY(-3px)" : "none",
        transition: "transform 0.2s, opacity 0.2s",
        height: element.type === "signature" && element.isFloating 
          ? isPrintPreview ? "80px" : "160px"
          : 'auto',
      }}
      onMouseDown={element.isFloating ? handleMouseDown : undefined}
      onClick={handleElementClick}
    >
      <div className={containerClassName}>
        {!isPrintPreview && !element.isFloating && (
          <div 
            ref={(node) => {
              dragHandleRef.current = node;
              if (node) {
                dragRef(node);
              }
            }}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
          >
            <GripVertical size={18} className="text-gray-500 bg-white p-1 rounded-full shadow-sm" />
          </div>
        )}
        
        <div className={isPrintPreview ? "" : "relative"}>
          {!isPrintPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
              className="absolute top-1/2 right-1 transform -translate-y-1/2 bg-transparent text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <X size={16} />
            </button>
          )}
          {renderElement()}
        </div>
      </div>
    </div>
  );
};