"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, Tooltip, TooltipTrigger, TooltipContent } from "@/components/shared";
import { ProposalParameters } from "@/types/create-proposal";
import AddVariable from "./add-variable";
import { ArrowRightIcon } from "lucide-react";

interface VariablesFormProps {
  parameters: ProposalParameters[];
  setParameters: (ProposalParameterss: ProposalParameters[]) => void;
  onNext: () => void;
}

export function VariablesForm({
  parameters,
  setParameters,
  onNext,
}: VariablesFormProps) {
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [newParameter, setNewParameter] = useState({
    name: "",
    type: "",
    value: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  useEffect(() => {
    const initialValues: Record<number, string> = {};
    parameters.forEach((v) => {
      initialValues[v.id] = (v.value ?? 0).toString();
    });
    setInputValues(initialValues);
    setOpenAccordions(Object.keys(groupedParameters));
  }, [parameters.length]);

  const handleParameterChange = (id: number, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: value.toString(),
    }));

    const updatedParameters = parameters.map((parameter) =>
      parameter.id === id ? { ...parameter, value: parseFloat(value) || 0 } : parameter
    );

    setParameters(updatedParameters);
  };

  const handleFocus = (id: number) => {
    if (inputValues[id] === "0") {
      setInputValues((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const handleBlur = (id: number) => {
    if (!inputValues[id]) {
      const newValue = "0";
      setInputValues((prev) => ({
        ...prev,
        [id]: newValue,
      }));

      const updatedParameters = parameters.map((parameters) =>
        parameters.id === id ? { ...parameters, value: parseFloat(newValue) || 0 } : parameters
      );
      setParameters(updatedParameters);
    } else {
      const currentValue = inputValues[id];
      const updatedParameters = parameters.map((parameters) =>
        parameters.id === id ? { ...parameters, value: parseFloat(currentValue) || 0 } : parameters
      );
      setParameters(updatedParameters);
    }
  };

  const handleSaveAll = () => {
    const updatedParameters = parameters.map((parameter) => ({
      ...parameter,
      value: parseFloat(inputValues[parameter.id]) || 0,
    }));

    setParameters(updatedParameters);
  };

  const handleAddParameter = () => {
    if (!newParameter.name || !newParameter.type) {
      console.error("Parameter name and type are required");
      return;
    }
    const newId =
      parameters.length > 0
        ? Math.max(...parameters.map((v) => v.id || 0)) + 1
        : 1;

    const parameterToAdd = {
      id: newId,
      name: newParameter.name,
      type: newParameter.type,
      value: parseFloat(newParameter.value) || 0,
      formula: "", 
      parameter: null, 
    };

    const updatedParameters = [...parameters, parameterToAdd];
    setParameters(updatedParameters);

    setInputValues((prev) => ({
      ...prev,
      [newId]: parameterToAdd.value.toString(),
    }));

    setNewParameter({ name: "", type: "", value: "0" });
    setIsDialogOpen(false);

    setOpenAccordions((prev) => Array.from(new Set([...prev, newParameter.type])));
  };

  const handleRemoveParameter = (id: number) => {
    const updatedParameters = parameters.filter((parameter) => parameter.id !== id);
    setParameters(updatedParameters);

    const newInputValues = { ...inputValues };
    delete newInputValues[id];
    setInputValues(newInputValues);
  };

  const handleAccordionChange = (type: string) => {
    setOpenAccordions((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const groupedParameters: Record<string, ProposalParameters[]> = {};
  parameters.forEach((parameter) => {
    if (!groupedParameters[parameter.type]) {
      groupedParameters[parameter.type] = [];
    }
    groupedParameters[parameter.type].push(parameter);
  });

  return (
    <div className="space-y-8">
      <div className="mb-6 flex flex-col items-center justify-center gap-2">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          Set Project Variables
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">🔢</span>
            </TooltipTrigger>
            <TooltipContent>
              <span>Define the values for each variable to calculate accurate costs. These variables make your proposal flexible and reusable!</span>
            </TooltipContent>
          </Tooltip>
        </h2>
        <p className="text-base text-gray-500 font-light max-w-2xl">Define the values for each variable to calculate accurate costs. These variables make your proposal flexible and reusable!</p>
      </div>
      <Card className="rounded-2xl shadow-lg border-0 p-8">
        <CardContent className="p-0 space-y-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Variables</h3>
              <p className="text-sm text-muted-foreground">Set values for each variable below. Grouped by type for clarity.</p>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <AddVariable
                      newParameter={newParameter}
                      setNewParameter={setNewParameter}
                      handleAddParameter={handleAddParameter}
                      isDialogOpen={isDialogOpen}
                      setIsDialogOpen={setIsDialogOpen}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Opens a dialog to add a new variable.</span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {Object.keys(groupedParameters).length === 0 && (
            <Card className="overflow-hidden rounded-xl border bg-gray-50">
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

          {Object.keys(groupedParameters).length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedParameters).map(([type, vars]) => (
                <Card key={type} className="overflow-hidden rounded-xl border bg-gray-50">
                  <CardContent className="p-0">
                    <div className="border-0 bg-transparent">
                      <button
                        type="button"
                        className={`w-full text-left text-base font-semibold px-4 py-3 hover:bg-gray-100 rounded-xl cursor-pointer flex items-center justify-between ${openAccordions.includes(type) ? "bg-gray-100" : ""}`}
                        onClick={() => handleAccordionChange(type)}
                        aria-expanded={openAccordions.includes(type)}
                        aria-controls={`accordion-content-${type}`}
                      >
                        <span>{type}</span>
                        <svg
                          className={`ml-2 h-4 w-4 transition-transform duration-200 ${openAccordions.includes(type) ? "rotate-180" : "rotate-0"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        id={`accordion-content-${type}`}
                        className={`transition-all duration-200 ${openAccordions.includes(type) ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4 pb-4 pt-2">
                          {vars.map((parameter) => (
                            <div key={parameter.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border">
                              <Label htmlFor={`parameter-${parameter.id}`} className="text-sm font-medium flex-1 truncate">
                                {parameter.name}
                              </Label>
                              <Input
                                id={`variable-${parameter.id}`}
                                type="number"
                                value={
                                  inputValues[parameter.id] !== undefined
                                    ? inputValues[parameter.id]
                                    : parameter.value || "0"
                                }
                                onChange={(e) => handleParameterChange(parameter.id, e.target.value)}
                                onFocus={(e) => {
                                  handleFocus(parameter.id);
                                  e.target.select(); // Select all value on focus
                                }}
                                onBlur={() => handleBlur(parameter.id)}
                                className="font-mono rounded-lg w-24 text-right"
                              />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveParameter(parameter.id)}
                                  >
                                    ×
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>Remove this variable</span>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                handleSaveAll();
                onNext();
              }}
              className="gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-black text-white hover:bg-gray-900 shadow-md"
            >
              Review Costs
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <span>Save and continue to cost calculation</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
