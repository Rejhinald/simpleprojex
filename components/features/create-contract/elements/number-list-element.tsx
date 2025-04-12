"use client";

import { useState } from "react";
import { ListItem, TextFormatting } from "../utils/types";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button, Input } from "@/components/shared";

interface NumberListElementProps {
  content: {
    items: ListItem[];
  };
  onChange: (content: any) => void;
  formatting?: TextFormatting;
  onFormattingChange?: (formatting: TextFormatting) => void;
  isPrintPreview?: boolean; // Add this prop for preview mode
}

export const NumberListElement = ({
  content,
  onChange,
  formatting = { fontSize: 16 },
  onFormattingChange,
  isPrintPreview = false // Default to false
}: NumberListElementProps) => {
  // Use local formatting only if global formatting is not provided
  const [localFormatting, setLocalFormatting] = useState<TextFormatting>({
    fontSize: 16,
  });

  // Determine which formatting to use (global or local)
  const activeFormatting = onFormattingChange ? formatting : localFormatting;
  const handleFormattingChange = onFormattingChange || setLocalFormatting;

  const updateItem = (id: string, text: string) => {
    const updatedItems = content.items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    onChange({ ...content, items: updatedItems });
  };

  const addItem = () => {
    const newItem: ListItem = { id: uuidv4(), text: "" };
    onChange({ ...content, items: [...content.items, newItem] });
  };

  const removeItem = (id: string) => {
    if (content.items.length <= 1) return;
    const updatedItems = content.items.filter((item) => item.id !== id);
    onChange({ ...content, items: updatedItems });
  };

  const textStyle = {
    fontSize: `${activeFormatting?.fontSize || 16}px`,
    fontWeight: activeFormatting?.bold ? "bold" : "normal",
    fontStyle: activeFormatting?.italic ? "italic" : "normal",
    textDecoration: activeFormatting?.underline ? "underline" : "none",
    color: activeFormatting?.color || "black",
    textAlign: activeFormatting?.alignment || "left",
  } as React.CSSProperties;

  return (
    <div className={isPrintPreview ? "space-y-1" : "space-y-1.5"}>
      <ol className={`list-decimal pl-7 ${isPrintPreview ? "space-y-0.5" : "space-y-1"}`}>
        {content.items.map((item, index) => (
          <li key={item.id} className="relative group pl-1">
            {/* If in preview mode, just render the text */}
            {isPrintPreview ? (
              <div style={textStyle}>{item.text}</div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  className="flex-1 py-0.5 min-h-8" // Reduced padding for more compact look
                  placeholder={`Item ${index + 1}`}
                  style={textStyle}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0.5"
                  disabled={content.items.length <= 1}
                >
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* Only show add button in edit mode */}
      {!isPrintPreview && (
        <div className="pt-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="text-blue-500 flex items-center gap-1 h-6 text-xs"
          >
            <Plus size={14} className="mr-1" /> Add item
          </Button>
        </div>
      )}
    </div>
  );
};