"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Switch, Input, Button, Tooltip, TooltipTrigger, TooltipContent
} from "@/components/shared"
import { VariableValue } from "./types"

interface VariableEditorProps {
  variable: VariableValue;
  showSuggestions: boolean;
  suggestions: Array<{ id: number; name: string; }>;
  calculatedValue?: number;
  onValueChange: (value: string) => void;
  onFormulaChange: (value: string) => void;
  onUseFormulaChange: (useFormula: boolean) => void;
  onInsertOperator: (operator: string) => void;
  onInsertVariable: (name: string) => void;
  onShowSuggestionsChange?: (show: boolean) => void; // Optional callback to let parent know about suggestion state
  allVariables?: Array<{ id: number; name: string; }>; // Add all variables for autocomplete
}

export function VariableEditor({
  variable,
  showSuggestions,
  suggestions,
  calculatedValue,
  onValueChange,
  onFormulaChange,
  onUseFormulaChange,
  onInsertOperator,
  onInsertVariable,
  onShowSuggestionsChange,
  allVariables = []
}: VariableEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [autoCompletePreview, setAutoCompletePreview] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [localShowSuggestions, setLocalShowSuggestions] = useState(showSuggestions);
  
  // Sync local state with props
  useEffect(() => {
    setLocalShowSuggestions(showSuggestions);
  }, [showSuggestions]);
  
  // Function to get text before cursor
  const getTextBeforeCursor = (): string => {
    const input = inputRef.current;
    if (!input) return '';
    
    return (variable.formula || '').substring(0, input.selectionStart || 0);
  };
  
  // Function to get current word being typed
  const getCurrentWord = (): { word: string, startPos: number } => {
    const textBeforeCursor = getTextBeforeCursor();
    const match = textBeforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)?$/);
    const word = match?.[0] || '';
    const startPos = textBeforeCursor.length - word.length;
    
    return { word, startPos };
  };
  
  // Update autocomplete suggestions when formula changes or cursor moves
  const updateAutoComplete = () => {
    if (!variable.useFormula || !inputRef.current) {
      setAutoCompletePreview(null);
      return;
    }
    
    const { word, startPos } = getCurrentWord();
    
    // Only show autocomplete for words of at least 2 characters
    if (word.length < 2) {
      setAutoCompletePreview(null);
      return;
    }
    
    // Find variables already used in the formula
    const usedVariables = new Set();
    const regex = /{([^}]+)}/g;
    let match;
    
    while ((match = regex.exec(variable.formula || '')) !== null) {
      usedVariables.add(match[1]);
    }
    
    // Filter variables that match the current word and haven't been used yet
    // (unless we're completing a partially used variable)
    // Also exclude the current variable being edited
    const filteredVariables = allVariables.filter(v => {
      // Skip the current variable (don't suggest itself)
      if (v.name === variable.name) return false;
      
      if (v.name.toLowerCase().startsWith(word.toLowerCase())) {
        // If we're completing a variable that's already been partially typed with braces
        if (variable.formula?.includes(`{${word}`)) {
          return true;
        }
        // Otherwise, only show variables not already used
        return !usedVariables.has(v.name);
      }
      return false;
    });
    
    if (filteredVariables.length > 0) {
      setAutoCompletePreview(filteredVariables[0].name);
    } else {
      setAutoCompletePreview(null);
    }
  };
  
  // Handle input changes with autocomplete
  const handleFormulaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormulaChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };
  
  // Handle key press for autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && autoCompletePreview) {
      e.preventDefault();
      
      const { word, startPos } = getCurrentWord();
      const formula = variable.formula || '';
      
      // Replace the current word with the autocompleted variable
      const newFormula = 
        formula.substring(0, startPos) + 
        `{${autoCompletePreview}}` + 
        formula.substring(startPos + word.length);
      
      onFormulaChange(newFormula);
      
      // Reset autocomplete
      setAutoCompletePreview(null);
    }
  };
  
  // Update cursor position on click
  const handleClick = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0);
  };
  
  // Update cursor position on selection change
  const handleSelect = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0);
  };
  
  // Handle suggestion item selection with mousedown to prevent blur
  const handleSuggestionSelect = (name: string) => {
    // Insert the selected variable
    onInsertVariable(name);
    
    // Keep focus on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Hide suggestions when the input loses focus
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the related target is inside our suggestions dropdown
    if (suggestionsRef.current && suggestionsRef.current.contains(e.relatedTarget as Node)) {
      // Don't hide suggestions if we're clicking inside the suggestions box
      return;
    }
    
    // Hide suggestions on blur
    setLocalShowSuggestions(false);
    
    // Notify parent component if callback provided
    if (onShowSuggestionsChange) {
      onShowSuggestionsChange(false);
    }
  };
  
  // Show suggestions again on focus if parent component has them enabled
  const handleFocus = () => {
    if (showSuggestions) {
      setLocalShowSuggestions(true);
    }
  };
  
  // Update autocomplete when formula changes or cursor moves
  useEffect(() => {
    updateAutoComplete();
  }, [variable.formula, cursorPosition]);
  
  // Filter out the current variable from suggestions
  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.name !== variable.name
  );
  
  return (
    <div className="p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h5>{variable.name}</h5>
        <span className="text-sm bg-secondary px-2 py-1 rounded-md">
          {variable.type}
        </span>
      </div>
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Formula</span>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="ml-2">
                <Switch 
                  checked={variable.useFormula || false}
                  onCheckedChange={onUseFormulaChange}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use formula instead of direct value</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="relative w-[calc(100%-130px)]">
          {variable.useFormula ? (
            // Formula input
            <>
              <div className="relative">
                <Input
                  ref={inputRef}
                  className="rounded-md"
                  placeholder="Enter formula (e.g., {Wall_Length} * {Wall_Width})"
                  value={variable.formula || ""}
                  onChange={handleFormulaInputChange}
                  onKeyDown={handleKeyDown}
                  onClick={handleClick}
                  onSelect={handleSelect}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                />
                
                {/* Autocomplete preview overlay */}
                {autoCompletePreview && (
                  <div className="absolute inset-0 pointer-events-none flex items-center">
                    <div className="pl-3 text-muted-foreground opacity-50">
                      {/* Calculate how much to offset the preview based on cursor position */}
                      <span className="invisible">{(variable.formula || '').substring(0, cursorPosition)}</span>
                      <span>{autoCompletePreview.substring(getCurrentWord().word.length)}</span>
                    </div>
                  </div>
                )}
                
                {/* Autocomplete hint */}
                {autoCompletePreview && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    Press Tab to complete
                  </div>
                )}
              </div>
              
              {/* Operator buttons for formula */}
              <div className="flex mt-2 space-x-1">
                {['+', '-', '*', '/', '(', ')'].map((op) => (
                  <Button
                    key={op}
                    type="button"
                    variant="outline"
                    className="h-7 w-7 p-0 text-xs rounded-md"
                    onClick={() => onInsertOperator(op)}
                  >
                    {op}
                  </Button>
                ))}
              </div>
              
              {/* Variable suggestions - only show when field is focused */}
              {showSuggestions && localShowSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-32 overflow-y-auto"
                >
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="p-2 hover:bg-accent cursor-pointer text-sm"
                        onMouseDown={() => handleSuggestionSelect(suggestion.name)}
                      >
                        {suggestion.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm">No suggestions</div>
                  )}
                </div>
              )}
              
              {/* Preview of calculated value */}
              {variable.formula && calculatedValue !== undefined && (
                <div className="mt-2 text-sm">
                  Calculated value: {calculatedValue}
                </div>
              )}
            </>
          ) : (
            // Direct value input
            <Input
              type="number"
              className="rounded-md"
              placeholder="Enter value"
              value={variable.value || ""}
              onChange={(e) => onValueChange(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
}