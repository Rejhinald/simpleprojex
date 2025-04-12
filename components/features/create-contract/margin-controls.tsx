"use client";

import { useState } from "react";
import { Input } from "@/components/shared";

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface MarginControlsProps {
  margins: PageMargins;
  onMarginsChange: (margins: PageMargins) => void;
}

export const MarginControls = ({ margins, onMarginsChange }: MarginControlsProps) => {
  const handleMarginChange = (side: keyof PageMargins, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      onMarginsChange({
        ...margins,
        [side]: numValue
      });
    }
  };

  return (
    <div className="flex items-center space-x-4 px-4 py-2 bg-white border-b">
      <h3 className="text-sm font-medium mr-2">Page Margins (px):</h3>
      <div className="flex items-center space-x-2">
        <label className="text-xs">Top:</label>
        <Input
          type="number"
          min={0}
          value={margins.top}
          onChange={(e) => handleMarginChange('top', e.target.value)}
          className="w-16 h-8 text-xs"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-xs">Right:</label>
        <Input
          type="number"
          min={0}
          value={margins.right}
          onChange={(e) => handleMarginChange('right', e.target.value)}
          className="w-16 h-8 text-xs"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-xs">Bottom:</label>
        <Input
          type="number"
          min={0}
          value={margins.bottom}
          onChange={(e) => handleMarginChange('bottom', e.target.value)}
          className="w-16 h-8 text-xs"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-xs">Left:</label>
        <Input
          type="number"
          min={0}
          value={margins.left}
          onChange={(e) => handleMarginChange('left', e.target.value)}
          className="w-16 h-8 text-xs"
        />
      </div>
    </div>
  );
};