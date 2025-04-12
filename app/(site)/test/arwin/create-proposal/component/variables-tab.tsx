"use client"

import { useEffect, useState } from "react"
import { 
  ScrollArea, Badge, Input, Button, Popover, 
  PopoverTrigger, PopoverContent, Select, SelectTrigger, 
  SelectValue, SelectContent, SelectItem
} from "@/components/shared"
import { Search, Plus } from "lucide-react"
import { VariableValue } from "./types"
import { VariableTypeTabs } from "./variable-type-tabs"
import { VariableEditor } from "./variable-editor"

interface VariablesTabProps {
  selectedTemplateData: any | null;
  variableValues: Record<number, VariableValue>;
  showSuggestions: Record<number, boolean>;
  onVariableValueChange: (variableId: number, value: string) => void;
  onInputTypeChange: (variableId: number, useFormula: boolean) => void;
  onFormulaChange: (variableId: number, value: string) => void;
  insertOperator: (variableId: number, operator: string) => void;
  insertVariable: (variableId: number, variableName: string) => void;
  getSuggestions: (input: string) => any[];
  evaluateFormula: (formula: string, variables: Record<number, VariableValue>) => number;
}

export function VariablesTab({
  selectedTemplateData,
  variableValues,
  showSuggestions,
  onVariableValueChange,
  onInputTypeChange,
  onFormulaChange,
  insertOperator,
  insertVariable,
  getSuggestions,
  evaluateFormula
}: VariablesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customParameterOpen, setCustomParameterOpen] = useState(false);
  const [customParameterType, setCustomParameterType] = useState<string | null>(null);
  const [customParameterName, setCustomParameterName] = useState("");
  
  // Filter variables based on search query
  const filteredVariables =
    selectedTemplateData?.variables.filter((variable: any) =>
      variable.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  // Get unique variable types
  const variableTypes = filteredVariables.length > 0 
    ? [...new Set(filteredVariables.map((v: any) => v.type))] as string[]
    : [] as string[];
  
  // Count variables by type
  const typeCounts = filteredVariables.reduce((acc: Record<string, number>, v: any) => {
    if (!acc[v.type]) acc[v.type] = 0;
    acc[v.type]++;
    return acc;
  }, {});
  
  if (!selectedTemplateData) {
    return (
      <div className="text-center py-8 bg-secondary/50 rounded-md">
        Select a template to view variables
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Search a variable"
            className="pl-10 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Popover open={customParameterOpen} onOpenChange={setCustomParameterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="rounded-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add custom parameter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4 rounded-md border shadow-lg" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm">Parameter Type</label>
                <Select onValueChange={(value) => setCustomParameterType(value)}>
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border shadow-lg">
                    <SelectItem value="Linear Feet">Linear Feet</SelectItem>
                    <SelectItem value="Square Feet">Square Feet</SelectItem>
                    <SelectItem value="Cubic Feet">Cubic Feet</SelectItem>
                    <SelectItem value="Count">Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Parameter Name</label>
                <Input
                  placeholder="Enter parameter name"
                  value={customParameterName}
                  onChange={(e) => setCustomParameterName(e.target.value)}
                  className="rounded-md"
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
                onClick={() => {
                  // Add custom parameter logic here
                  setCustomParameterOpen(false);
                  setCustomParameterType(null);
                  setCustomParameterName("");
                }}
              >
                Add Parameter
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {filteredVariables.length > 0 ? (
        <VariableTypeTabs variableTypes={variableTypes} typeCounts={typeCounts}>
          {(selectedType) => {
            const visibleVariables = selectedType 
              ? filteredVariables.filter((v: any) => v.type === selectedType)
              : filteredVariables;
              
            return (
              <ScrollArea className="border rounded-md overflow-hidden shadow-sm h-[400px]">
                <div className="p-1">
                  {visibleVariables.map((variable: any) => {
                    const variableValue = variableValues[variable.id] || {
                      id: variable.id,
                      name: variable.name,
                      type: variable.type,
                      value: 0,
                      useFormula: false
                    };
                    
                    let calculatedValue;
                    if (variableValue.useFormula && variableValue.formula) {
                      calculatedValue = evaluateFormula(variableValue.formula, variableValues);
                    }
                    
                    const suggestions = variableValue.useFormula && showSuggestions[variable.id]
                      ? getSuggestions((variableValue.formula || "").split(/[\s\+\-\*\/\(\)]/).pop() || "")
                      : [];
                      
                    return (
                      <div
                        key={variable.id}
                        className="border-b last:border-b-0"
                      >
                        <VariableEditor
                          variable={variableValue}
                          showSuggestions={
                            showSuggestions[variable.id] || false
                          }
                          suggestions={suggestions}
                          calculatedValue={calculatedValue}
                          onValueChange={(value) =>
                            onVariableValueChange(variable.id, value)
                          }
                          onFormulaChange={(value) =>
                            onFormulaChange(variable.id, value)
                          }
                          onUseFormulaChange={(useFormula) =>
                            onInputTypeChange(variable.id, useFormula)
                          }
                          onInsertOperator={(operator) =>
                            insertOperator(variable.id, operator)
                          }
                          onInsertVariable={(name) =>
                            insertVariable(variable.id, name)
                          }
                          allVariables={selectedTemplateData?.variables || []}
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            );
          }}
        </VariableTypeTabs>
      ) : (
        <div className="text-center py-8">
          {searchQuery ? "No variables match your search" : "No variables found in this template"}
        </div>
      )}
    </div>
  );
}