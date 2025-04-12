"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent } from "@/components/shared";
import type { Variable } from "@/types/proposals";
import { ArrowRightIcon, XCircleIcon } from "lucide-react";
import AddVariable from "./add-variable";

interface VariablesFormProps {
  variables: Variable[];
  setVariables: (variables: Variable[]) => void;
  onNext: () => void;
}

export function VariablesForm({
  variables,
  setVariables,
  onNext,
}: VariablesFormProps) {
  // Track input values with controlled inputs
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [newVariable, setNewVariable] = useState({
    name: "",
    type: "",
    value: "0",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize input values from props
  useEffect(() => {
    const initialValues: Record<number, string> = {};
    variables.forEach((v) => {
      initialValues[v.id] = v.value || "0";
    });
    setInputValues(initialValues);
  }, [variables.length]); // Only run when variables are added/removed

  const handleVariableChange = (id: number, value: string) => {
    // Update the input value in our local state
    setInputValues((prev) => ({
      ...prev,
      [id]: value.toString(),
    }));

    // Immediately update parent state
    const updatedVariables = variables.map((variable) =>
      variable.id === id ? { ...variable, value } : variable
    );

    // Debug to console to verify updates
    console.log(`Variable ${id} changed to: ${value}`);
    console.log("Updated variables:", updatedVariables);

    // Update parent state
    setVariables(updatedVariables);
  };

  const handleFocus = (id: number) => {
    // When input is focused and value is "0", clear it
    if (inputValues[id] === "0") {
      setInputValues((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const handleBlur = (id: number) => {
    // When input loses focus and is empty, set it back to "0"
    if (!inputValues[id]) {
      const newValue = "0";
      setInputValues((prev) => ({
        ...prev,
        [id]: newValue,
      }));

      // Also update parent state
      const updatedVariables = variables.map((variable) =>
        variable.id === id ? { ...variable, value: newValue.toString() } : variable
      );
      setVariables(updatedVariables);
    } else {
      // Make sure parent state is updated with current input value
      const currentValue = inputValues[id];
      const updatedVariables = variables.map((variable) =>
        variable.id === id ? { ...variable, value: currentValue.toString() } : variable
      );
      setVariables(updatedVariables);
    }
  };

  const handleSaveAll = () => {
    // Force save all current input values to parent state
    const updatedVariables = variables.map((variable) => ({
      ...variable,
      value: inputValues[variable.id] || "0",
    }));

    console.log("Saving all variables:", updatedVariables);
    setVariables(updatedVariables);
  };

  // Inside the VariablesForm component

  const handleAddVariable = () => {
    // Validate required fields
    if (!newVariable.name || !newVariable.type) {
      console.error("Variable name and type are required");
      return;
    }

    // Generate a new unique ID
    const newId =
      variables.length > 0
        ? Math.max(...variables.map((v) => v.id || 0)) + 1
        : 1;

    // Create the new variable object
    const variableToAdd = {
      id: newId,
      name: newVariable.name,
      type: newVariable.type,
      value: newVariable.value.toString() || "0",
    };

    console.log("Adding new variable:", variableToAdd);

    // Update parent state with the new variable array
    const updatedVariables = [...variables, variableToAdd];
    setVariables(updatedVariables);

    // Update local input values
    setInputValues((prev) => ({
      ...prev,
      [newId]: variableToAdd.value,
    }));

    // Reset the new variable form
    setNewVariable({ name: "", type: "", value: "0" });

    // Close the dialog
    setIsDialogOpen(false);
  };

  const handleRemoveVariable = (id: number) => {
    const updatedVariables = variables.filter((variable) => variable.id !== id);

    // Update parent state
    setVariables(updatedVariables);

    // Remove from local input values
    const newInputValues = { ...inputValues };
    delete newInputValues[id];
    setInputValues(newInputValues);
  };

  // Group variables by type using the props variables
  const groupedVariables: Record<string, Variable[]> = {};
  variables.forEach((variable) => {
    if (!groupedVariables[variable.type]) {
      groupedVariables[variable.type] = [];
    }
    groupedVariables[variable.type].push(variable);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Set Project Variables</h3>
          <p className="text-sm text-muted-foreground">
            Define the values for each variable to calculate accurate costs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveAll} className="gap-1">
            Save Values
          </Button>
          <AddVariable
            newVariable={newVariable}
            setNewVariable={setNewVariable}
            handleAddVariable={handleAddVariable}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
        </div>
      </div>

      {Object.entries(groupedVariables).map(([type, vars]) => (
        <Card key={type} className="overflow-hidden">
          <CardContent>
            <h3 className="text-lg font-bold mt-4"> {type} Variables</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vars.map((variable) => (
                <div key={variable.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`variable-${variable.id}`}
                      className="text-sm font-medium"
                    >
                      {variable.name}
                    </Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveVariable(variable.id)}
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`variable-${variable.id}`}
                      type="text"
                      value={
                        inputValues[variable.id] !== undefined
                          ? inputValues[variable.id]
                          : variable.value || "0"
                      }
                      onChange={(e) =>
                        handleVariableChange(variable.id, e.target.value)
                      }
                      onFocus={() => handleFocus(variable.id)}
                      onBlur={() => handleBlur(variable.id)}
                      className="font-mono"
                    />
                    <span className="text-sm text-muted-foreground">
                      {type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Show a message when there are no variables */}
      {Object.keys(groupedVariables).length === 0 && (
        <Card className="overflow-hidden">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No variables yet. Add a variable to get started.
            </p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => setIsDialogOpen(true)}
            >
              Add Variable
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            // Save all values before proceeding
            handleSaveAll();
            onNext();
          }}
          className="gap-2"
        >
          Review Costs <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
