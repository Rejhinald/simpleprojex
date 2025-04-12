"use client";

import { useRef, useState, useEffect } from "react";
import { TipTapEditor } from "../utils/tiptap-editor";
import { TextFormatting } from "../utils/types";

interface HeaderElementProps {
  content: {
    text: string;
    level: number;
  };
  onChange: (content: any) => void;
  formatting?: TextFormatting;
  onFormattingChange?: (formatting: TextFormatting) => void;
  isPrintPreview?: boolean;
}

export const HeaderElement = ({ 
  content, 
  onChange,
  formatting = { fontSize: 24, bold: true },
  onFormattingChange,
  isPrintPreview = false
}: HeaderElementProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Create a merged formatting object that uses the user's formatting choices
  // but ensures a base level of styling for headers
  const mergedFormatting = {
    bold: true, // Headers should always be bold by default
    fontSize: 24, // Default size for H1
    ...formatting, // Override with user's formatting choices
  };
  
  // Use proper font size based on header level if not explicitly set
  useEffect(() => {
    if (!onFormattingChange) return;

    // Only adjust fontSize if it matches the default for a different level
    const isUsingDefaultFontSize = 
      formatting?.fontSize === 24 || 
      formatting?.fontSize === 20 || 
      formatting?.fontSize === 18;
      
    if (isUsingDefaultFontSize) {
      // Set appropriate default size based on level
      const newSize = content.level === 1 ? 24 : content.level === 2 ? 20 : 18;
      
      if (newSize !== formatting?.fontSize) {
        onFormattingChange({
          ...mergedFormatting,
          fontSize: newSize
        });
      }
    }
  }, [content.level, formatting, mergedFormatting, onFormattingChange]);
  
  const handleTextChange = (html: string) => {
    // Extract text content while preserving formatting information
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    onChange({ ...content, text: plainText });
  };
  
  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };
  
  // Get appropriate header tag based on level
  const getHeaderTag = () => {
    switch(content.level) {
      case 1: return 'h1';
      case 2: return 'h2'; 
      case 3: return 'h3';
      default: return 'h1';
    }
  };
  
  // Convert plain text to HTML for the editor
  const getEditorContent = () => {
    const tag = getHeaderTag();
    return content.text ? `<${tag}>${content.text}</${tag}>` : '';
  };
  
  // Apply inline styles based on the formatting
  const headerStyle = {
    fontSize: `${mergedFormatting.fontSize || 24}px`,
    fontWeight: mergedFormatting.bold !== false ? 'bold' : 'normal', // Default to bold unless explicitly set to false
    fontStyle: mergedFormatting.italic ? 'italic' : 'normal',
    textDecoration: mergedFormatting.underline ? 'underline' : 'none',
    color: mergedFormatting.color || 'inherit',
    textAlign: mergedFormatting.alignment || mergedFormatting.textAlign || 'left',
    marginTop: isPrintPreview ? '0.5em' : '0',
    marginBottom: isPrintPreview ? '0.2em' : '0',
    padding: 0,
    lineHeight: mergedFormatting.lineHeight ? String(mergedFormatting.lineHeight) : '1.35',
    fontFamily: mergedFormatting.fontFamily || 'inherit',
  } as React.CSSProperties;

  return (
    <div 
      ref={containerRef}
      className={`w-full transition-colors ${isFocused ? 'bg-blue-50 rounded' : ''}`}
    >
      {isPrintPreview ? (
        // In print preview, just render the text with the correct styling
        <div style={headerStyle}>
          {content.text || `Heading ${content.level}`}
        </div>
      ) : (
        // In edit mode, use the TipTap editor with proper header formatting
        <TipTapEditor
          value={getEditorContent()}
          onChange={handleTextChange}
          formatting={mergedFormatting}
          onFormattingChange={onFormattingChange}
          placeholder={`Heading ${content.level}...`}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )}
    </div>
  );
};