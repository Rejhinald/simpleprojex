"use client";

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared";
import { TextFormatting } from "./utils/types";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, MoreVertical } from "lucide-react";

interface FormattingToolbarProps {
  formatting: TextFormatting;
  onFormattingChange: (formatting: TextFormatting) => void;
  isDisabled?: boolean;
  activeElementType?: string;
  onHeaderLevelChange?: (level: number) => void;
  headerLevel?: number;
}

// Available font families
const FONT_FAMILIES = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Tahoma, sans-serif", label: "Tahoma" },
  { value: "Palatino, serif", label: "Palatino" },
];

// Line spacing options
const LINE_HEIGHT_OPTIONS = [
  { value: 1, label: "1.0" },
  { value: 1.15, label: "1.15" },
  { value: 1.35, label: "1.35" },
  { value: 1.5, label: "1.5" },
  { value: 1.75, label: "1.75" },
  { value: 2, label: "2.0" },
  { value: 2.5, label: "2.5" },
];

export const FormattingToolbar = ({ 
  formatting, 
  onFormattingChange,
  isDisabled = false,
  activeElementType,
  onHeaderLevelChange,
  headerLevel = 1
}: FormattingToolbarProps) => {
  
  const toggleFormatting = (property: keyof TextFormatting) => {
    if (isDisabled) return;
    
    // Create a new formatting object with the toggled property
    const newFormatting = { ...formatting };
    
    // Toggle the boolean value, making sure it's always a boolean (true/false) rather than true/undefined
    if (property === 'bold' || property === 'italic' || property === 'underline') {
      newFormatting[property] = !newFormatting[property];
    }
    
    onFormattingChange(newFormatting);
  };
  
  const setAlignment = (alignment: "left" | "center" | "right") => {
    if (isDisabled) return;
    // Set both alignment and textAlign properties for compatibility
    onFormattingChange({ ...formatting, alignment, textAlign: alignment });
  };
  
  const setFontSize = (fontSize: number) => {
    if (isDisabled) return;
    onFormattingChange({ ...formatting, fontSize });
  };
  
  const setColor = (color: string) => {
    if (isDisabled) return;
    onFormattingChange({ ...formatting, color });
  };

  const setFontFamily = (fontFamily: string) => {
    if (isDisabled) return;
    onFormattingChange({ ...formatting, fontFamily });
  };

  const setLineHeight = (lineHeight: number) => {
    if (isDisabled) return;
    onFormattingChange({ ...formatting, lineHeight });
  };

  const isHeaderSelected = activeElementType === "header";
  
  return (
    <div className={`flex items-center space-x-2 ${isDisabled ? "opacity-50" : ""}`}>
      <div className="text-sm text-gray-500 font-medium mr-2">
        {isDisabled ? "Select element to format" : "Text Formatting"}
      </div>
      
      {/* Header Level Selector - only shown when a header is selected */}
      {isHeaderSelected && onHeaderLevelChange && (
        <>
          <Select
            value={String(headerLevel)}
            onValueChange={(value) => onHeaderLevelChange(Number(value))}
            disabled={isDisabled}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
              <div className="flex items-center justify-center gap-1">
                <Type size={14} className="flex-shrink-0" />
                <span>H{headerLevel}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
              <SelectItem value="4">H4</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-8 w-px bg-gray-300 mx-1"></div>
        </>
      )}
      
      {/* Font Family Selector */}
      <Select
        value={formatting.fontFamily || "Arial, sans-serif"}
        onValueChange={setFontFamily}
        disabled={isDisabled}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={String(formatting.fontSize || 16)}
        onValueChange={(value) => setFontSize(Number(value))}
        disabled={isDisabled}
      >
        <SelectTrigger className="h-8 w-16 text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="h-8 w-px bg-gray-300 mx-1"></div>
      
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 ${formatting.bold ? "bg-blue-100" : ""}`}
        onClick={() => toggleFormatting("bold")}
        title="Bold"
        disabled={isDisabled}
      >
        <Bold size={16} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 ${formatting.italic ? "bg-blue-100" : ""}`}
        onClick={() => toggleFormatting("italic")}
        title="Italic"
        disabled={isDisabled}
      >
        <Italic size={16} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 ${formatting.underline ? "bg-blue-100" : ""}`}
        onClick={() => toggleFormatting("underline")}
        title="Underline"
        disabled={isDisabled}
      >
        <Underline size={16} />
      </Button>
      
      <div className="h-8 w-px bg-gray-300 mx-1"></div>
      
      {/* Line Spacing Control */}
      <Select
        value={String(formatting.lineHeight || 1.35)}
        onValueChange={(value) => setLineHeight(Number(value))}
        disabled={isDisabled}
      >
        <SelectTrigger className="h-8 w-16 text-xs" title="Line Spacing">
          <div className="flex items-center justify-center gap-1">
            <MoreVertical size={14} className="flex-shrink-0" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {LINE_HEIGHT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="h-8 w-px bg-gray-300 mx-1"></div>
      
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 ${formatting.alignment === "left" ? "bg-blue-100" : ""}`}
        onClick={() => setAlignment("left")}
        title="Align Left"
        disabled={isDisabled}
      >
        <AlignLeft size={16} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 ${formatting.alignment === "center" ? "bg-blue-100" : ""}`}
        onClick={() => setAlignment("center")}
        title="Align Center"
        disabled={isDisabled}
      >
        <AlignCenter size={16} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 ${formatting.alignment === "right" ? "bg-blue-100" : ""}`}
        onClick={() => setAlignment("right")}
        title="Align Right"
        disabled={isDisabled}
      >
        <AlignRight size={16} />
      </Button>
      
      <div className="h-8 w-px bg-gray-300 mx-1"></div>
      
      <input
        type="color"
        value={formatting.color || "#000000"}
        onChange={(e) => setColor(e.target.value)}
        className="w-8 h-8 p-1 border rounded"
        title="Text Color"
        disabled={isDisabled}
      />
    </div>
  );
};