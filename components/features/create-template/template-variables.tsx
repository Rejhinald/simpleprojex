"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Button,
  Input,
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
  Checkbox,
  Card,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/shared";
import { PlusCircle, XCircle, Check, ChevronsUpDown, Pencil } from "lucide-react";
import { Parameters, TemplateParametersProps } from "@/types/templates";
import { useParameters } from "@/hooks/api/lookup/use-parameters";

export default function TemplateVariables({
  parameter = [],
  onUpdateTemplate,
  onNext,
  onPrevious,
}: TemplateParametersProps) {
  const [templateParameters, setTemplateParameters] =
    useState<Parameters[]>(parameter);
  const [parameterName, setParameterName] = useState("");
  const [parameterType, setParameterType] = useState("Linear Feet");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { parameters, isLoading, error } = useParameters();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  useEffect(() => {
    setTemplateParameters(parameter || []);
  }, []);

  const filteredParameters =
    parameters?.filter((parameter) =>
      parameter.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const parameterTypes = ["Linear Feet", "Square Feet", "Cubic Feet", "Count"];

  const addParameter = () => {
    if (!parameterName.trim()) return;

    const newParameter = {
      id: templateParameters.length + 1,
      name: parameterName,
      type: parameterType,
    };

    const updatedParameters = [...templateParameters, newParameter];
    setTemplateParameters(updatedParameters);

    onUpdateTemplate((prevTemplate) => ({
      ...prevTemplate,
      parameters: updatedParameters,
    }));

    setParameterName("");
    setParameterType("Count");
  };

  const removeParameter = (id: number) => {
    const updatedParameters = templateParameters.filter(
      (variable) => variable.id !== id
    );
    setTemplateParameters(updatedParameters);

    onUpdateTemplate((prevTemplate) => ({
      ...prevTemplate,
      parameters: updatedParameters,
    }));
  };

  const handleSaveAndContinue = () => {
    onUpdateTemplate((prevTemplate) => ({
      ...prevTemplate,
      parameters: templateParameters,
    }));
    onNext();
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(templateParameters.map((parameter) => parameter.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const batchDelete = () => {
    const updatedParameters = templateParameters.filter(
      (parameter) => !selectedIds.includes(parameter.id)
    );
    setTemplateParameters(updatedParameters);
    setSelectedIds([]);

    onUpdateTemplate((prevTemplate) => ({
      ...prevTemplate,
      parameters: updatedParameters,
    }));
  };

  const startEdit = (id: number, name: string, type: string) => {
    setEditId(id);
    setEditName(name);
    setEditType(type);
  };

  const saveEdit = (id: number) => {
    const updatedParameters = templateParameters.map((parameter) =>
      parameter.id === id ? { ...parameter, name: editName, type: editType } : parameter
    );
    setTemplateParameters(updatedParameters);
    setEditId(null);
    setEditName("");
    setEditType("");

    onUpdateTemplate((prevTemplate) => ({
      ...prevTemplate,
      parameters: updatedParameters,
    }));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditType("");
  };

  // Helper for variable type badge
  const typeBadge = (type: string) => {
    return (
      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {type}
      </span>
    );
  };

  // Sort and group parameters by type
  const groupedParameters: Record<string, Parameters[]> = {};
  [...templateParameters].sort((a, b) => (a.type ?? "").localeCompare(b.type ?? "")).forEach((parameter) => {
    const type = parameter.type ?? "Unknown";
    if (!groupedParameters[type]) {
      groupedParameters[type] = [];
    }
    groupedParameters[type].push(parameter);
  });

  return (
    <div className="h-full">
      <Card className="p-8 bg-white shadow-lg rounded-2xl border-0">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center tracking-tight flex items-center justify-center gap-2">
          Template Variables
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">🔢</span>
            </TooltipTrigger>
            <TooltipContent>
              <span>🔢 Variables are the dimensions and parameters your template will use. They make your template flexible and reusable!</span>
            </TooltipContent>
          </Tooltip>
        </h2>
        <div className="mb-6 text-center">
          <p className="text-base text-gray-500 font-light">Define the variables and dimensions your template will use.</p>
        </div>
        {/* Add Variable Section - styled like categories */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-3 items-center">
            <label className="block mb-2 text-sm font-medium text-gray-800 items-center gap-1">
              Add Variable
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">🆕</span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>➕ Create a new variable for your template. Use this for custom measurements or counts!</span>
                </TooltipContent>
              </Tooltip>
            </label>
            <Input
              value={parameterName}
              onChange={(e) => setParameterName(e.target.value)}
              placeholder="Enter new variable name"
              className="flex-1 rounded-xl border-gray-200 bg-gray-50 p-3 text-base focus:ring-2 focus:ring-black/10 transition-all"
              style={{ zIndex: 1 }}
            />
            <Select value={parameterType} onValueChange={setParameterType}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200 bg-white text-base focus:ring-2 focus:ring-black/10">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {parameterTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={addParameter} 
              className="rounded-xl px-5 py-2 text-base font-semibold bg-green-800 text-white hover:bg-green-900 shadow-md"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add
            </Button>
          </div>
          <div className="flex gap-3 items-center">
            {/* Tooltip for Add Existing Variable - left of combobox */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs rounded-full border px-1.5 cursor-pointer">📚</span>
              </TooltipTrigger>
              <TooltipContent>
                <span>📚 Pick from variables you’ve already created before. Handy for reusing common parameters!</span>
              </TooltipContent>
            </Tooltip>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  role="combobox" 
                  aria-expanded={open} 
                  className="w-full justify-between rounded-xl text-base font-semibold border-gray-200 bg-white hover:bg-gray-50 shadow-sm flex items-center gap-1"
                >
                  <span>Add Existing Variable</span>
                  <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 rounded-xl shadow-md" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search variables..." 
                    value={search}
                    onValueChange={setSearch}
                    className="rounded-xl text-base"
                  />
                  <CommandEmpty>
                    {isLoading ? "Loading..." : "No variables found."}
                  </CommandEmpty>
                  <CommandGroup className="max-h-[180px] overflow-auto">
                    {error ? (
                      <div className="p-2 text-center text-red-500 text-base">
                        Error loading variables
                      </div>
                    ) : filteredParameters.length === 0 && !isLoading ? (
                      <div className="p-2 text-center text-base">
                        No matching variables
                      </div>
                    ) : (
                      filteredParameters.map((parameter) => {
                        const isSelected = templateParameters.some(
                          (v) =>
                            v.name === parameter.name &&
                            v.type === parameter.type
                        );
                        return (
                          <CommandItem
                            key={parameter.id}
                            value={parameter.name}
                            onSelect={() => {
                              if (!isSelected) {
                                const newParameter = {
                                  id: templateParameters.length + 1,
                                  name: parameter.name,
                                  type: parameter.type,
                                };
                                const updatedParameters = [
                                  ...templateParameters,
                                  newParameter,
                                ];
                                setTemplateParameters(updatedParameters);
                                onUpdateTemplate((prevTemplate) => ({
                                  ...prevTemplate,
                                  parameters: updatedParameters,
                                }));
                              } else {
                                const variableToRemove =
                                  templateParameters.find(
                                    (v) =>
                                      v.name === parameter.name &&
                                      v.type === parameter.type
                                  );
                                if (variableToRemove) {
                                  const updatedParameters =
                                    templateParameters.filter(
                                      (v) => v.id !== variableToRemove.id
                                    );
                                  setTemplateParameters(updatedParameters);
                                  onUpdateTemplate((prevTemplate) => ({
                                    ...prevTemplate,
                                    parameters: updatedParameters,
                                  }));
                                }
                              }
                              setOpen(false);
                            }}
                            className="text-base"
                          >
                            <div className="flex flex-1 items-center justify-between">
                              <div>
                                <span className="font-semibold">
                                  {parameter.name}
                                </span>
                                {typeBadge(parameter.type)}
                              </div>
                              {isSelected && (
                                <Check className="h-5 w-5 text-black" />
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
        {/* Added Variables Section */}
        <div className="flex flex-col">
          {templateParameters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-3xl mb-2">🔢</span>
              <span className="font-semibold text-base">No variables added yet.</span>
              <span className="text-xs mt-1">Start by adding a variable above.</span>
            </div>
          ) : (
            <div className="flex-1 overflow-visible">
              {/* Tooltip for the variables list */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">Your Variables</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">📋</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>📋 Here you’ll see all the variables you’ve added. Edit or remove them as needed!</span>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="w-full">
                {Object.entries(groupedParameters).map(([type, params], idx) => (
                  <div key={type} className={idx !== 0 ? "mt-8" : ""}>
                    <div className="px-1 pb-2">
                      <h3 className="text-base font-bold text-gray-700 uppercase tracking-wide mb-2">{type}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {params.map((parameter) => (
                        <div
                          key={parameter.id}
                          className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm border"
                        >
                          {editId === parameter.id ? (
                            <>
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-32 text-base h-9 py-1 rounded-xl"
                              />
                              <Select value={editType} onValueChange={setEditType}>
                                <SelectTrigger className="w-32 text-base h-9 rounded-xl">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {parameterTypes.map((type) => (
                                    <SelectItem key={type} value={type} className="text-base">
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-1 ml-auto">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" onClick={() => saveEdit(parameter.id)} className="h-8 px-3 text-xs rounded-xl">
                                      Save
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Save changes</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 px-3 text-xs rounded-xl">
                                      Cancel
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Cancel editing</TooltipContent>
                                </Tooltip>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-base truncate max-w-[180px]">{parameter.name}</span>
                              {typeBadge(parameter.type || "")}
                              <div className="flex gap-1 ml-auto">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => startEdit(parameter.id, parameter.name || "", parameter.type || "")}
                                      className="h-8 w-8 p-0 rounded-xl"
                                    >
                                      <Pencil className="h-4 w-4 text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit variable</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeParameter(parameter.id)}
                                      className="h-8 w-8 p-0 rounded-xl"
                                    >
                                      <XCircle className="h-5 w-5 text-red-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Remove variable</TooltipContent>
                                </Tooltip>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={onPrevious} 
            className="px-5 py-2 rounded-xl text-base font-semibold"
          >
            Previous
          </Button>
          <Button 
            onClick={handleSaveAndContinue} 
            className="px-5 py-2 rounded-xl text-base font-semibold bg-black text-white hover:bg-gray-900 shadow-md"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
