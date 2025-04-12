"use client";

import { useCallback, memo } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/shared";
import { PageSize } from "./utils/types";

interface PageSizeSelectorProps {
  currentSize: PageSize;
  onSizeChange: (size: PageSize) => void;
}

// Memoize the component to prevent unnecessary re-renders
export const PageSizeSelector = memo(({ 
  currentSize, 
  onSizeChange 
}: PageSizeSelectorProps) => {
  // Use a callback to handle selection changes instead of directly passing the event
  const handleSizeChange = useCallback((value: string) => {
    // Only trigger the change if the value is actually different
    if (value !== currentSize) {
      onSizeChange(value as PageSize);
    }
  }, [onSizeChange, currentSize]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Page Size:</span>
      <Select 
        value={currentSize} 
        onValueChange={handleSizeChange}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a4">A4</SelectItem>
          <SelectItem value="letter">Letter</SelectItem>
          <SelectItem value="legal">Legal</SelectItem>
          <SelectItem value="short">Short Form</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});