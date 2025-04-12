"use client";

import { useRef, useMemo } from "react";
import { Element, PageSize } from "./utils/types";
import { getPageDimensions } from "./utils/page-sizes";
import { X, Printer, Download } from "lucide-react";
import { PageMargins } from "./margin-controls";
import { BulletListElement } from "./elements/bullet-list-element";
import { NumberListElement } from "./elements/number-list-element"; 
import { TableElement } from "./elements/table-element";

interface PrintPreviewProps {
  elements: Element[];
  pageSize: PageSize;
  pageMargins: PageMargins;
  onClose: () => void;
  allPages?: number; // Total number of pages
}

export const PrintPreview = ({ 
  elements, 
  pageSize, 
  pageMargins, 
  onClose,
  allPages = 1
}: PrintPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = getPageDimensions(pageSize);
  
  // Organize elements by page number
  const elementsByPage = useMemo(() => {
    // Determine total number of pages from passed allPages or from element pageNumbers
    const maxPageFromElements = Math.max(1, ...elements.map(el => el.pageNumber || 1));
    const totalPages = Math.max(allPages, maxPageFromElements);
    
    // Create structure to hold elements for each page
    const pages = new Array(totalPages).fill(0).map((_, index) => ({
      pageNumber: index + 1,
      elements: [] as Element[]
    }));
    
    // Sort elements into their respective pages
    elements.forEach(element => {
      const pageNumber = element.pageNumber || 1; // Default to page 1 if no page is specified
      if (pageNumber <= totalPages) {
        pages[pageNumber - 1].elements.push({...element});
      }
    });
    
    return pages;
  }, [elements, allPages]);
  
  // Handle print action
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const pageStyle = `
      @page {
        size: ${pageSize === 'a4' ? 'A4' : pageSize === 'letter' ? 'letter' : pageSize === 'legal' ? 'legal' : 'A4'};
        margin: 0; /* Set margins to 0 since we're handling them in the layout */
      }
      body {
        margin: 0;
        padding: 0;
        background-color: white;
        font-family: Arial, sans-serif;
      }
      .page-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .page {
        width: ${width}px;
        height: ${height}px;
        position: relative;
        margin: 0 auto;
        margin-bottom: 20px;
        background: white;
        box-sizing: border-box;
        overflow: hidden;
        padding: ${pageMargins.top}px ${pageMargins.right}px ${pageMargins.bottom}px ${pageMargins.left}px;
        page-break-after: always;
      }
      .page:last-child {
        page-break-after: avoid;
      }
      .contract-content {
        width: 100%;
        height: 100%;
        position: relative;
      }
      .element-wrapper {
        position: absolute;
        width: 100%;
      }
      /* Hide buttons and editing controls */
      button, .editing-controls, .resize-handle {
        display: none !important;
      }
      /* Clean formatting for contract elements */
      table {
        border-collapse: collapse;
        width: 100%;
      }
      table td, table th {
        border: 1px solid #ddd;
        padding: 8px;
      }
      /* Typography refinements */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 0;
        margin-bottom: 0.5em;
      }
      p {
        margin-top: 0;
        margin-bottom: 1em;
      }
      ul, ol {
        margin-top: 0;
        margin-bottom: 1em;
      }
    `;
    
    let pagesHtml = '';
    
    // Generate HTML for each page
    elementsByPage.forEach(({ pageNumber, elements: pageElements }) => {
      // Sort elements by Y position for proper document flow
      const sortedElements = [...pageElements]
        .filter(el => !el.isFloating)
        .sort((a, b) => a.position.y - b.position.y);
      
      // Sort floating elements separately
      const floatingElements = [...pageElements].filter(el => el.isFloating);
      
      const pageHtml = `
        <div class="page">
          <div class="contract-content">
            ${sortedElements.map(element => {
              const top = element.position.y - pageMargins.top;
              return `
                <div class="element-wrapper" style="position: absolute; top: ${top}px; width: 100%;">
                  ${renderElementToHtml(element, width - (pageMargins.left + pageMargins.right))}
                </div>
              `;
            }).join('')}
            
            ${floatingElements.map(element => {
              return `
                <div style="position: absolute; left: ${element.position.x}px; top: ${element.position.y}px;">
                  ${renderElementToHtml(element, width - (pageMargins.left + pageMargins.right), true)}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      
      pagesHtml += pageHtml;
    });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contract</title>
          <style>${pageStyle}</style>
        </head>
        <body>
          <div class="page-container">
            ${pagesHtml}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for any resources to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  
  // Helper function to render elements to HTML string for printing
  const renderElementToHtml = (element: Element, contentWidth: number, isFloating: boolean = false) => {
    const styles = getElementStyles(element);
    
    switch (element.type) {
      case 'header': {
        const level = element.content.level || 1;
        const headerStyles = {
          ...styles,
          lineHeight: '1.5',
          fontWeight: 'bold',
          marginTop: level === 1 ? '10px' : level === 2 ? '8px' : '6px',
          marginBottom: level === 1 ? '10px' : level === 2 ? '8px' : '6px',
          fontSize: level === 1 ? '24px' : level === 2 ? '20px' : '18px',
          padding: '0',
          display: 'block',
          width: '100%'
        };
        
        return `<div style="${getStyleString(headerStyles)}">${element.content.text}</div>`;
      }
      
      case 'text': {
        const textStyles = {
          ...styles,
          margin: '0',
          padding: '0',
          lineHeight: '1.35',
          minHeight: '22px'
        };
        
        return `<div style="${getStyleString(textStyles)}">${element.content.text}</div>`;
      }
      
      case 'bulletList': {
        const items = element.content.items || [];
        return `<ul style="${getStyleString(styles)}">
          ${items.map(item => `<li>${item.text}</li>`).join('')}
        </ul>`;
      }
      
      case 'numberList': {
        const items = element.content.items || [];
        return `<ol style="${getStyleString(styles)}">
          ${items.map(item => `<li>${item.text}</li>`).join('')}
        </ol>`;
      }
      
      case 'table': {
        const tableStyles = {
          ...styles,
          borderCollapse: 'collapse',
          width: '100%'
        };
        
        const tableData = element.content.data || [];
        
        return `
          <table style="${getStyleString(tableStyles)}">
            ${tableData.map((row, rowIndex) => `
              <tr>
                ${row.map((cell, colIndex) => 
                  rowIndex === 0 
                    ? `<th style="border: 1px solid #ddd; padding: 8px;">${cell}</th>`
                    : `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`
                ).join('')}
              </tr>
            `).join('')}
          </table>
        `;
      }
      
      case 'signature': {
        const signatureStyles = {
          ...styles,
          padding: '10px',
          width: isFloating ? '350px' : '200px',
          textAlign: 'center'
        };
        
        if (element.content.imageData) {
          return `
            <div style="${getStyleString(signatureStyles)}">
              <div>${element.content.label || 'Signature'}</div>
              <img 
                src="${element.content.imageData}" 
                alt="Signature" 
                style="max-width: 90%; max-height: 60px; margin: 10px auto; display: block;"
              />
            </div>
          `;
        } else if (element.content.signatureType === 'initials' && element.content.initials) {
          return `
            <div style="${getStyleString(signatureStyles)}">
              <div>${element.content.label || 'Initials'}</div>
              <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 10px auto;">
                <span style="font-size: 24px; font-weight: bold; font-style: italic; color: #2563eb;">
                  ${element.content.initials}
                </span>
              </div>
            </div>
          `;
        } else {
          return `
            <div style="${getStyleString(signatureStyles)}">
              <div>${element.content.label || 'Signature'}</div>
              <div style="height: 60px; border-bottom: 1px solid #ccc; margin-top: 10px;"></div>
            </div>
          `;
        }
      }
      
      default:
        return `<div>Element: ${element.type}</div>`;
    }
  };
  
  // Helper to convert style object to inline style string
  const getStyleString = (styles: Record<string, any>) => {
    return Object.entries(styles)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  };
  
  // Download as PDF 
  const handleDownload = () => {
    // Just use the print functionality with 'Save as PDF' option
    handlePrint();
  };
  
  // Calculate relative position for elements to respect margins without showing them
  const getAdjustedPosition = (element: Element) => {
    if (element.isFloating) {
      // For floating elements, position them relative to the page margins
      return {
        left: element.position.x,
        top: element.position.y
      };
    } else {
      // For regular elements, position them within the content area
      return {
        left: 0, // Regular elements are full width
        top: element.position.y - pageMargins.top // Adjust for top margin
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] max-w-[90vw]">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Contract Preview</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                <Download size={16} />
                <span>Download PDF</span>
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview container with multiple pages */}
        <div className="p-8 bg-gray-100 overflow-auto" ref={containerRef}>
          {elementsByPage.map(({ pageNumber, elements: pageElements }) => (
            <div 
              key={`page-${pageNumber}`}
              className="relative mx-auto bg-white shadow-md overflow-hidden scale-75 origin-top mb-12" 
              style={{ 
                width: `${width}px`, 
                height: `${height}px`,
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {/* Content area that respects margins */}
              <div className="absolute" style={{
                top: `${pageMargins.top}px`,
                left: `${pageMargins.left}px`,
                width: `${width - (pageMargins.left + pageMargins.right)}px`,
                height: `${height - (pageMargins.top + pageMargins.bottom)}px`
              }}>
                {/* Render non-floating elements in document flow order */}
                {pageElements
                  .filter(element => !element.isFloating)
                  .sort((a, b) => a.position.y - b.position.y)
                  .map(element => {
                    const { top } = getAdjustedPosition(element);
                    const elementKey = `${element.id}-preview-${pageNumber}`;
                    return (
                      <div
                        key={elementKey}
                        className="element-wrapper"
                        style={{
                          position: 'absolute',
                          top: `${top}px`,
                          width: '100%'
                        }}
                      >
                        <ElementPreview 
                          element={element} 
                          contentWidth={width - (pageMargins.left + pageMargins.right)}
                        />
                      </div>
                    );
                  })
                }
                
                {/* Render floating elements */}
                {pageElements
                  .filter(element => element.isFloating)
                  .map(element => {
                    const { left, top } = getAdjustedPosition(element);
                    const elementKey = `${element.id}-preview-floating-${pageNumber}`;
                    return (
                      <div
                        key={elementKey}
                        style={{
                          position: 'absolute',
                          left: `${left}px`,
                          top: `${top}px`
                        }}
                      >
                        <ElementPreview 
                          element={element} 
                          contentWidth={width - (pageMargins.left + pageMargins.right)}
                          isFloating
                        />
                      </div>
                    );
                  })
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Get element styles as object for consistent styling
const getElementStyles = (element: Element) => {
  const baseStyles: React.CSSProperties = {
    width: '100%' // Ensure elements take full width
  };
  
  if (element.formatting) {
    if (element.formatting.fontSize) {
      baseStyles.fontSize = `${element.formatting.fontSize}px`;
    }
    if (element.formatting.bold) {
      baseStyles.fontWeight = 'bold';
    }
    if (element.formatting.italic) {
      baseStyles.fontStyle = 'italic';
    }
    if (element.formatting.underline) {
      baseStyles.textDecoration = 'underline';
    }
    if (element.formatting.color) {
      baseStyles.color = element.formatting.color;
    }
    // Use either textAlign or alignment, whichever is defined
    if (element.formatting.textAlign) {
      baseStyles.textAlign = element.formatting.textAlign;
    } else if (element.formatting.alignment) {
      baseStyles.textAlign = element.formatting.alignment;
    }
  }
  
  return baseStyles;
};

// Simplified element renderer specifically for print preview
interface ElementPreviewProps {
  element: Element;
  contentWidth: number;
  isFloating?: boolean;
}

const ElementPreview = ({ element, contentWidth, isFloating }: ElementPreviewProps) => {
  // Apply element formatting
  const styles = getElementStyles(element);
  
  // Helper function to safely render HTML content
  const renderHTML = (htmlContent: string) => {
    return { __html: htmlContent };
  };
  
  // Render different element types
  switch (element.type) {
    case 'header': {
      // For headers, use appropriate heading level based on content.level
      const level = element.content.level || 1;
      // Define exact font sizes for each header level to match editor view exactly
      const headerStyles = {
        ...styles,
        lineHeight: '1.5', // Increased line height for better spacing
        fontWeight: 'bold',
        marginTop: level === 1 ? '10px' : level === 2 ? '8px' : '6px',
        marginBottom: level === 1 ? '10px' : level === 2 ? '8px' : '6px',
        fontSize: level === 1 ? '24px' : level === 2 ? '20px' : '18px',
        padding: '0', // Remove any default padding
        display: 'block', // Ensure block display
        width: '100%' // Full width
      };
      
      // Render the appropriate heading based on level with consistent styling
      return (
        <div style={headerStyles}>
          {element.content.text}
        </div>
      );
    }
    
    case 'text': {
      // For text elements, render HTML content safely with consistent styling
      const textStyles = {
        ...styles,
        margin: '0',
        padding: '0',
        lineHeight: '1.35', // Match the line height from the editor
        minHeight: '22px' // Match the min-height from the editor
      };
      
      // Check if content already has HTML tags
      const hasHtmlTags = /<[a-z][\s\S]*>/i.test(element.content.text);
      
      return (
        <div style={textStyles}>
          {hasHtmlTags ? (
            <div dangerouslySetInnerHTML={renderHTML(element.content.text)} />
          ) : (
            <div>{element.content.text}</div>
          )}
        </div>
      );
    }
    
    case 'bulletList': {
      // Pass isPrintPreview prop to BulletListElement for proper display in preview
      const bulletListStyles = {
        ...styles,
        margin: '4px 0', // Reduced margin for more compact appearance
      };
      
      // Import and reuse the BulletListElement component from our element components
      // which properly handles bullets in print preview mode
      return (
        <div style={bulletListStyles}>
          <BulletListElement
            content={element.content}
            onChange={() => {}} // No-op since this is preview only
            formatting={element.formatting}
            isPrintPreview={true}
          />
        </div>
      );
    }
    
    case 'numberList': {
      // Pass isPrintPreview prop to NumberListElement for proper display in preview
      const numberListStyles = {
        ...styles,
        margin: '4px 0', // Reduced margin for more compact appearance
      };
      
      // Import and reuse the NumberListElement component from our element components
      // which properly handles numbers in print preview mode
      return (
        <div style={numberListStyles}>
          <NumberListElement
            content={element.content}
            onChange={() => {}} // No-op since this is preview only
            formatting={element.formatting}
            isPrintPreview={true}
          />
        </div>
      );
    }
    
    case 'table':
      return (
        <div style={styles}>
          <TableElement
            content={element.content}
            onChange={() => {}} // No-op since this is preview only
            formatting={element.formatting}
            contentWidth={contentWidth}
            isPrintPreview={true}
          />
        </div>
      );
    
    case 'signature':
      return (
        <div style={{ 
          ...styles,
          padding: '10px',
          width: isFloating ? '350px' : '200px', // Increased from 200px to 350px for floating signatures
          textAlign: 'center'
        }}>
          <div>{element.content.label || 'Signature'}</div>
          {element.content.imageData ? (
            <img 
              src={element.content.imageData} 
              alt="Signature" 
              style={{ 
                maxWidth: '90%',
                maxHeight: '60px',
                margin: '10px auto',
                display: 'block'
              }}
            />
          ) : element.content.signatureType === 'initials' && element.content.initials ? (
            <div style={{ 
              height: '60px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '10px auto'
            }}>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                fontStyle: 'italic',
                color: '#2563eb' // blue-600
              }}>
                {element.content.initials}
              </span>
            </div>
          ) : (
            <div style={{ height: '60px', borderBottom: '1px solid #ccc', marginTop: '10px' }}></div>
          )}
        </div>
      );
    
    default:
      return <div>Unsupported element type: {element.type}</div>;
  }
};