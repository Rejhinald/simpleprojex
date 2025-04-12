"use client";

import { useRef, useEffect, useState } from "react";
import { TipTapEditor } from "../utils/tiptap-editor";
import { TextFormatting } from "../utils/types";

interface TextElementProps {
  content: {
    text: string;
  };
  onChange: (content: any) => void;
  element?: { id: string };
  formatting?: TextFormatting;
  onFormattingChange?: (formatting: TextFormatting) => void;
  isPrintPreview?: boolean; // Add support for print preview mode
}

export const TextElement = ({ 
  content, 
  onChange, 
  element,
  formatting = { fontSize: 16 },
  onFormattingChange,
  isPrintPreview = false // Default to false
}: TextElementProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (html: string) => {
    onChange({ ...content, text: html });
  };
  
  // Add an effect to ensure the container triggers resize events properly
  useEffect(() => {
    if (containerRef.current) {
      // Force a layout update whenever text content changes
      const observer = new ResizeObserver(() => {
        // This will notify parent components about size changes
        if (element?.id) {
          const event = new CustomEvent('elementresized', { 
            bubbles: true,
            detail: { id: element.id, height: containerRef.current?.offsetHeight || 0 }
          });
          containerRef.current?.dispatchEvent(event);
        }
      });
      
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [content.text, element?.id]);

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Apply formatting styles to the container
  const textStyle: React.CSSProperties = {
    fontWeight: formatting?.bold ? "bold" : "normal",
    fontStyle: formatting?.italic ? "italic" : "normal",
    textDecoration: formatting?.underline ? "underline" : "none",
    color: formatting?.color || "#000000",
    fontSize: `${formatting?.fontSize || 16}px`,
    textAlign: formatting?.alignment || formatting?.textAlign || "left",
    lineHeight: formatting?.lineHeight ? String(formatting.lineHeight) : "1.35",
    fontFamily: formatting?.fontFamily || "Arial, sans-serif",
  };

  // If in print preview mode, render formatted content directly
  if (isPrintPreview) {
    return (
      <div 
        ref={containerRef}
        className="w-full"
        style={{ 
          minHeight: '22px',
          overflow: 'visible',
          margin: '0',
          padding: '2px 4px',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          width: '100%',
          boxSizing: 'border-box',
          ...textStyle
        }}
        dangerouslySetInnerHTML={{ __html: content.text }}
      />
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full transition-colors ${isFocused ? 'bg-blue-50 rounded' : ''}`}
      style={{ 
        minHeight: '22px',
        overflow: 'visible',
        margin: '0',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        width: '100%',
        boxSizing: 'border-box',
      }}
      data-element-id={element?.id}
    >
      <TipTapEditor
        value={content.text}
        onChange={handleTextChange}
        formatting={formatting}
        onFormattingChange={onFormattingChange}
        placeholder="Enter text here..."
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
};