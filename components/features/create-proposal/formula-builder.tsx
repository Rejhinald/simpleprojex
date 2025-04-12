"use client";

import type React from "react";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Badge,
} from "@/components/shared";
import type { Variable } from "@/types/proposals";
import { Check, Plus, X } from "lucide-react";

interface FormulaBuilderProps {
  variables: Variable[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FormulaBuilder({
  variables,
  value,
  onChange,
  placeholder,
}: FormulaBuilderProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Get the word at the current cursor position
  const getCurrentWord = (text: string, position: number): string => {
    const beforeCursor = text.substring(0, position);
    const matches = beforeCursor.match(/[A-Za-z0-9\s_]+$/);
    return matches ? matches[0].trim() : "";
  };

  // Filter variables based on the current word
  const filteredVariables = useMemo(() => {
    const currentWord = getCurrentWord(inputValue, cursorPosition);
    if (!currentWord) return [];

    return variables.filter((variable) =>
      variable.name.toLowerCase().includes(currentWord.toLowerCase())
    );
  }, [variables, inputValue, cursorPosition]);

  const insertVariable = (variable: Variable) => {
    const input = inputRef.current;
    if (!input) return;

    // Find the start of the current word
    const beforeCursor = inputValue.substring(0, cursorPosition);
    const afterCursor = inputValue.substring(cursorPosition);

    const wordStartMatch = beforeCursor.match(/[A-Za-z0-9\s_]+$/);
    const wordStart = wordStartMatch
      ? beforeCursor.length - wordStartMatch[0].length
      : cursorPosition;

    // Replace the current word with the variable name
    const newValue =
      inputValue.substring(0, wordStart) + variable.name + afterCursor;
    setInputValue(newValue);
    onChange(newValue);

    // Close the suggestions
    setSuggestionsOpen(false);

    // Focus back on the input and set cursor position after the inserted variable
    setTimeout(() => {
      if (input) {
        input.focus();
        const newCursorPosition = wordStart + variable.name.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
        setCursorPosition(newCursorPosition);
      }
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);

    // Show suggestions if we're typing a word
    const currentWord = getCurrentWord(
      e.target.value,
      e.target.selectionStart || 0
    );
    setSuggestionsOpen(currentWord.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Update cursor position on arrow keys
    setTimeout(() => {
      if (inputRef.current) {
        setCursorPosition(inputRef.current.selectionStart || 0);
      }
    }, 0);

    // Handle special keys for suggestion navigation
    if (suggestionsOpen && filteredVariables.length > 0) {
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        insertVariable(filteredVariables[0]);
      } else if (e.key === "Escape") {
        setSuggestionsOpen(false);
      }
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

  const insertOperator = (operator: string) => {
    const input = inputRef.current;
    if (!input) return;

    const textBefore = inputValue.substring(0, cursorPosition);
    const textAfter = inputValue.substring(cursorPosition);

    // Insert the operator at cursor position
    const newValue = `${textBefore} ${operator} ${textAfter}`;
    setInputValue(newValue);
    onChange(newValue);

    // Focus back on the input and set cursor position after the inserted operator
    setTimeout(() => {
      if (input) {
        input.focus();
        const newCursorPosition = cursorPosition + operator.length + 2; // +2 for the spaces
        input.setSelectionRange(newCursorPosition, newCursorPosition);
        setCursorPosition(newCursorPosition);
      }
    }, 0);
  };

  // Highlight variable names in the formula
  const highlightedFormula = useMemo(() => {
    let formula = inputValue;
    const variableNames = variables
      .map((v) => v.name)
      .sort((a, b) => b.length - a.length); // Sort by length to match longest first

    // Replace variable names with highlighted spans
    variableNames.forEach((name) => {
      const regex = new RegExp(`\\b${name}\\b`, "g");
      formula = formula.replace(
        regex,
        `<span class="text-primary font-semibold">${name}</span>`
      );
    });

    return formula;
  }, [inputValue, variables]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={handleClick}
              onFocus={() => {
                if (inputRef.current) {
                  setCursorPosition(inputRef.current.selectionStart || 0);
                }
              }}
              placeholder={placeholder}
              className="pr-10 font-mono"
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => {
                  setInputValue("");
                  onChange("");
                  setSuggestionsOpen(false);
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add variable</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Command>
                <CommandInput placeholder="Search variables..." />
                <CommandList>
                  <CommandEmpty>No variables found.</CommandEmpty>
                  <CommandGroup heading="Variables">
                    {variables.map((variable) => (
                      <CommandItem
                        key={variable.id}
                        value={variable.name}
                        onSelect={() => insertVariable(variable)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            inputValue.includes(variable.name)
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {variable.name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {variable.type}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Variable suggestions dropdown */}
        {suggestionsOpen && filteredVariables.length > 0 && (
          <div className="absolute left-0 z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
            <div className="max-h-60 overflow-auto p-1">
              {filteredVariables.map((variable) => (
                <div
                  key={variable.id}
                  className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => insertVariable(variable)}
                >
                  <div className="font-medium">{variable.name}</div>
                  <Badge variant="outline" className="text-xs">
                    {variable.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Operator buttons */}
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => insertOperator("+")}
        >
          +
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => insertOperator("-")}
        >
          -
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => insertOperator("*")}
        >
          ×
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => insertOperator("/")}
        >
          ÷
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => insertOperator("(")}
        >
          (
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => insertOperator(")")}
        >
          )
        </Button>
      </div>

      {/* Formula preview with highlighted variables */}
      {inputValue && (
        <div className="rounded-md border bg-muted/30 p-2 text-sm">
          <div
            className="font-mono"
            dangerouslySetInnerHTML={{ __html: highlightedFormula }}
          />
        </div>
      )}
    </div>
  );
}
