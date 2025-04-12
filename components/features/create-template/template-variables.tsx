"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared";
import { PlusCircle, XCircle, List, Check, ChevronsUpDown } from "lucide-react";
import { Template, Variable, TemplateVariablesProps } from "@/types/templates";
import { useParameters } from "@/hooks/api/lookup/use-parameters";

export default function TemplateVariables({
  variables = [],
  onUpdateTemplate,
  onNext,
  onPrevious,
}: TemplateVariablesProps) {
  const [templateVariables, setTemplateVariables] =
    useState<Variable[]>(variables);
  const [variableName, setVariableName] = useState("");
  const [variableType, setVariableType] = useState("Linear Feet");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { parameters, isLoading, error } = useParameters();

  // Sync local state with template prop when it changes (only on initial mount and explicit prop changes)
  useEffect(() => {
    setTemplateVariables(variables || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on initial mount

  // Filter parameters based on search query
  const filteredParameters =
    parameters?.filter((parameter) =>
      parameter.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const variableTypes = ["Linear Feet", "Square Feet", "Cubic Feet", "Count"];

  const addVariable = () => {
    if (!variableName.trim()) return;

    const newVariable = {
      name: variableName,
      type: variableType,
    };

    const updatedVariables = [...templateVariables, newVariable];
    setTemplateVariables(updatedVariables);

    // Save to parent component
    onUpdateTemplate((prevTemplate) => ({
      ...prevTemplate,
      variables: updatedVariables,
    }));

    // Reset inputs
    setVariableName("");
    setVariableType("Count");
  };

  const removeVariable = (id: number) => {
    const updatedVariables = templateVariables.filter(
      (variable) => variable.id !== id
    );
    setTemplateVariables(updatedVariables);

    // Save to parent component
    onUpdateTemplate((prevTemplate) => ({
      ...prevTemplate,
      variables: updatedVariables,
    }));
  };

  const handleSaveAndContinue = () => {
    onUpdateTemplate((prevTemplate) => ({
      ...prevTemplate,
      variables: templateVariables,
    }));
    onNext();
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Template Variables</h2>
      <p className="text-gray-600 mb-4">
        Define the variables that will be used in your template's cost
        calculations.
      </p>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="variableName" className="block mb-2 font-medium">
              Variable Name
            </label>
            <Input
              id="variableName"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              placeholder="e.g. Wall Height"
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="variableType" className="block mb-2 font-medium">
              Variable Type
            </label>
            <Select value={variableType} onValueChange={setVariableType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a unit type" />
              </SelectTrigger>
              <SelectContent>
                {variableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="block mb-2 font-medium">Actions</label>
            <div className="flex gap-2">
              <Button onClick={addVariable} className="flex-1">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Variable
              </Button>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex-1 justify-between"
                  >
                    <span>Select Parameter</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="end">
                  <Command>
                    <CommandInput
                      placeholder="Search parameters..."
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandEmpty>
                      {isLoading ? "Loading..." : "No parameters found."}
                    </CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {error ? (
                        <div className="p-2 text-center text-red-500 text-sm">
                          Error loading parameters
                        </div>
                      ) : filteredParameters.length === 0 && !isLoading ? (
                        <div className="p-2 text-center text-sm">
                          No matching parameters
                        </div>
                      ) : (
                        filteredParameters.map((parameter) => {
                          // Check if this parameter is already added to template variables
                          const isSelected = templateVariables.some(
                            (v) =>
                              v.name === parameter.name &&
                              v.type === (parameter.category || parameter.type)
                          );

                          return (
                            <CommandItem
                              key={parameter.id}
                              value={parameter.name}
                              onSelect={() => {
                                if (!isSelected) {
                                  // Add parameter if not already selected
                                  const newVariable = {
                                    id: templateVariables.length + 1,
                                    name: parameter.name,
                                    type: parameter.category || parameter.type,
                                  };
                                  const updatedVariables = [
                                    ...templateVariables,
                                    newVariable,
                                  ];
                                  setTemplateVariables(updatedVariables);

                                  // Save to parent component
                                  onUpdateTemplate((prevTemplate) => ({
                                    ...prevTemplate,
                                    variables: updatedVariables,
                                  }));
                                } else {
                                  // Remove parameter if already selected
                                  const variableToRemove =
                                    templateVariables.find(
                                      (v) =>
                                        v.name === parameter.name &&
                                        v.type ===
                                          (parameter.category || parameter.type)
                                    );
                                  if (variableToRemove) {
                                    const updatedVariables =
                                      templateVariables.filter(
                                        (v) => v.id !== variableToRemove.id
                                      );
                                    setTemplateVariables(updatedVariables);

                                    // Save to parent component
                                    onUpdateTemplate((prevTemplate) => ({
                                      ...prevTemplate,
                                      variables: updatedVariables,
                                    }));
                                  }
                                }
                                // Keep the dropdown open to allow multiple selections
                                // setOpen(false);
                              }}
                            >
                              <div className="flex flex-1 items-center justify-between">
                                <div>
                                  <span className="font-medium">
                                    {parameter.name}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-500">
                                    ({parameter.category})
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-black" />
                                )}
                              </div>
                            </CommandItem>
                          );
                        })
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {templateVariables.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Added Variables</h3>
            <div className="border rounded-md divide-y">
              {templateVariables.map((variable) => (
                <div
                  key={variable.id}
                  className="flex justify-between items-center p-3"
                >
                  <div>
                    <span className="font-medium">{variable.name}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({variable.type})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariable(variable.id)}
                  >
                    <XCircle className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={handleSaveAndContinue}>Next</Button>
        </div>
      </div>
    </Card>
  );
}
