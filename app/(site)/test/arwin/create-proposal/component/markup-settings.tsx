"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, Switch, Slider, Input } from "@/components/shared"
import { cn } from "@/lib/utils"
import { TemplateItem } from "./types"

interface MarkupSettingsProps {
  selectedTemplateData: TemplateItem | null;
  useGlobalMarkup: boolean;
  globalMarkup: number;
  onUseGlobalMarkupChange: (checked: boolean) => void;
  onGlobalMarkupChange: (value: number[]) => void;
}

export function MarkupSettings({
  selectedTemplateData,
  useGlobalMarkup,
  globalMarkup,
  onUseGlobalMarkupChange,
  onGlobalMarkupChange
}: MarkupSettingsProps) {
  const [inputValue, setInputValue] = useState(globalMarkup.toString())

  // Update input field when slider value changes
  useEffect(() => {
    setInputValue(globalMarkup.toString())
  }, [globalMarkup])

  // Handle direct input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Only update the actual value if it's a valid number
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onGlobalMarkupChange([numValue])
    }
  }

  // Handle blur to reset input to valid value if needed
  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue)
    
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      // Reset to previous valid value if input is invalid
      setInputValue(globalMarkup.toString())
    } else {
      // Format to match slider value format
      setInputValue(numValue.toString())
    }
  }

  if (!selectedTemplateData) return null;
  
  return (
    <Card className="shadow-sm rounded-lg">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Markup Settings</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">Use Global Markup</span>
            <Switch 
              checked={useGlobalMarkup} 
              onCheckedChange={onUseGlobalMarkupChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-md">Global Markup</span>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                disabled={!useGlobalMarkup}
                className="w-16 h-8 text-right rounded-md"
              />
              <span className="text-md">%</span>
            </div>
          </div>
          <Slider
            disabled={!useGlobalMarkup}
            defaultValue={[15]}
            max={100}
            step={1}
            value={[globalMarkup]}
            onValueChange={onGlobalMarkupChange}
            className={cn(
              "w-full",
              !useGlobalMarkup && "opacity-100"
            )}
          />
          <p className="text-sm">
            {useGlobalMarkup 
              ? "This markup will be applied to all elements in this proposal."
              : "Global markup is disabled. Individual element markups will be used."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}