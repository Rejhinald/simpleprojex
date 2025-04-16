"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Switch,
} from "@/components/shared";
import { TooltipProvider } from "@/providers/tooltip-provider";
import { ProposalData } from "@/types/create-proposal";
import { calculateCost } from "@/helpers/calculate-cost";
import {
  ArrowRightIcon,
  DollarSignIcon,
  PlusCircleIcon,
  XCircleIcon,
  PencilIcon,
  AlertCircleIcon,
  Info,
} from "lucide-react";
import { FormulaBuilder } from "./formula-builder";
import { CostCalculationProps } from "@/types/create-proposal";
import { checkFormulaErrors } from "@/helpers/calculate-cost";
import { ProjectElement } from "@/types/proposals";

// Extracted ElementDialog component
interface ElementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  element: {
    categoryId: number | null;
    name: string;
    formula: string;
    labor_formula: string;
    markup_percentage: number;
  };
  onChange: (element: any) => void;
  onSave: () => void;
  onCancel: () => void;
  parameters: any[];
  isEditing: boolean;
}

function ElementDialog({
  isOpen,
  onOpenChange,
  element,
  onChange,
  onSave,
  onCancel,
  parameters,
  isEditing,
}: ElementDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Element" : "Add New Element"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this cost element"
              : "Create a new element with material and labor cost formulas"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="element-name">Element Name</Label>
            <Input
              id="element-name"
              value={element.name}
              onChange={(e) => onChange({ ...element, name: e.target.value })}
              placeholder="e.g., Wall Painting"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="material-cost">Material Cost Formula</Label>
            <FormulaBuilder
              parameters={parameters}
              value={element.formula}
              onChange={(value) => onChange({ ...element, formula: value })}
              placeholder="e.g., Wall Length * Wall Width * Paint Cost"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="labor-cost">Labor Cost Formula</Label>
            <FormulaBuilder
              parameters={parameters}
              value={element.labor_formula}
              onChange={(value) =>
                onChange({ ...element, labor_formula: value })
              }
              placeholder="e.g., Wall Length * Wall Width * Hourly Rate"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="markup-percentage">Markup Percentage (%)</Label>
            <Input
              id="markup-percentage"
              type="number"
              min="0"
              max="100"
              value={element.markup_percentage}
              onChange={(e) =>
                onChange({
                  ...element,
                  markup_percentage: Number(e.target.value),
                })
              }
              placeholder="10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {isEditing ? "Update Element" : "Add Element"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CostCalculation({
  proposal,
  onNext,
  onUpdateProposal,
}: CostCalculationProps) {
  const [localProposal, setLocalProposal] = useState<ProposalData>(proposal);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [newElement, setNewElement] = useState<{
    categoryId: number | null;
    name: string;
    formula: string;
    labor_formula: string;
    markup_percentage: number;
  }>({
    categoryId: null,
    name: "",
    formula: "",
    labor_formula: "",
    markup_percentage: 10,
  });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isElementDialogOpen, setIsElementDialogOpen] = useState(false);
  const [editingElementId, setEditingElementId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const userChangeRef = useRef(false);

  useEffect(() => {
    setLocalProposal(proposal);
  }, [proposal]);

  useEffect(() => {
    if (userChangeRef.current && onUpdateProposal) {
      onUpdateProposal(localProposal);
      userChangeRef.current = false;
    }
  }, [localProposal, onUpdateProposal]);

  useEffect(() => {
    // Whenever useGlobalMarkup or globalMarkupPercentage changes, update all markups in localProposal
    if (localProposal.useGlobalMarkup) {
      const globalMarkup = String(localProposal.globalMarkupPercentage || 15);
      setLocalProposal((prev) => ({
        ...prev,
        template_elements: prev.template_elements.map(el => ({
          ...el,
          markup: globalMarkup,
        }))
      }));
    }
  }, [localProposal.useGlobalMarkup, localProposal.globalMarkupPercentage]);

  const calculatedCosts = useMemo(() => {
    const elementsByCategory = (localProposal.modules || []).reduce(
      (acc, module) => {
        const categoryId = module.id;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        const categoryElements = localProposal.template_elements.filter(
          (element) => element.module.id === categoryId
        );
        acc[categoryId] = categoryElements;
        return acc;
      },
      {} as Record<number, typeof localProposal.template_elements>
    );

    return localProposal.modules.map((category) => {
      const elements = elementsByCategory[category.id] || [];
      return {
        ...category,
        elements: elements.map((templateElement) => {
          // Always use the formula string for calculation
          const materialFormula = templateElement.element.formula || templateElement.material_cost || "0";
          const laborFormula = templateElement.element.labor_formula || templateElement.labor_cost || "0";
          const markupString = templateElement.markup || "0";
          const markup = parseFloat(markupString) || 0;

          const materialFormulaHasErrors = checkFormulaErrors(
            materialFormula,
            localProposal.parameters
          );

          const laborFormulaHasErrors = checkFormulaErrors(
            laborFormula,
            localProposal.parameters
          );

          const materialCost = materialFormulaHasErrors
            ? 0
            : calculateCost(materialFormula, localProposal.parameters);

          const laborCost = laborFormulaHasErrors
            ? 0
            : calculateCost(laborFormula, localProposal.parameters);

          const baseCost = materialCost + laborCost;
          const markupPercentage = localProposal.useGlobalMarkup
            ? localProposal.globalMarkupPercentage || 15
            : markup;

          const markupAmount = baseCost * (markupPercentage / 100);

          return {
            ...templateElement,
            materialFormulaHasErrors,
            laborFormulaHasErrors,
            calculatedMaterialCost: materialCost,
            calculatedLaborCost: laborCost,
            markup: markupString,
            markupPercentage,
            markupAmount,
            totalWithMarkup: baseCost + markupAmount,
            // Always show the formula string for review
            material_cost: materialFormula,
            labor_cost: laborFormula,
          };
        }),
      };
    });
  }, [
    localProposal.modules,
    localProposal.template_elements,
    localProposal.useGlobalMarkup,
    localProposal.globalMarkupPercentage,
    localProposal.parameters,
  ]);

  const totalMaterialCost = useMemo(() => {
    return calculatedCosts.reduce((total, category) => {
      return (
        total +
        category.elements.reduce((catTotal, element) => {
          return catTotal + (element.calculatedMaterialCost || 0);
        }, 0)
      );
    }, 0);
  }, [calculatedCosts]);

  const totalLaborCost = useMemo(() => {
    return calculatedCosts.reduce((total, category) => {
      return (
        total +
        category.elements.reduce((catTotal, element) => {
          return catTotal + (element.calculatedLaborCost || 0);
        }, 0)
      );
    }, 0);
  }, [calculatedCosts]);

  const totalMarkupAmount = useMemo(() => {
    return calculatedCosts.reduce((total, category) => {
      return (
        total +
        category.elements.reduce((catTotal, element) => {
          return catTotal + (element.markupAmount || 0);
        }, 0)
      );
    }, 0);
  }, [calculatedCosts]);

  const grandTotal = totalMaterialCost + totalLaborCost + totalMarkupAmount;

  const handleAddCategory = () => {
    if (!newCategory.name) return;

    const newId =
      localProposal.modules && localProposal.modules.length > 0
        ? Math.max(...localProposal.modules.map((c) => c.id)) + 1
        : 1;

    const moduleToAdd = {
      id: newId,
      name: newCategory.name,
      description: "",
      created_at: "",
      updated_at: "",
    };

    userChangeRef.current = true;
    const updatedProposal = {
      ...localProposal,
      modules: [...(localProposal.modules || []), moduleToAdd],
    };

    setLocalProposal(updatedProposal);
    setNewCategory({ name: "" });
    setIsCategoryDialogOpen(false);
  };

  const handleRemoveCategory = (categoryId: number) => {
    // Remove the category from modules
    const updatedModules = localProposal.modules.filter(
      (module) => module.id !== categoryId
    );

    // Remove all template_elements associated with this category
    const updatedTemplateElements = localProposal.template_elements.filter(
      (element) => {
        // Support both .module and .project_module for category reference
        const moduleId = element.module?.id || element.project_module?.id;
        return moduleId !== categoryId;
      }
    );

    userChangeRef.current = true;
    setLocalProposal({
      ...localProposal,
      modules: updatedModules,
      template_elements: updatedTemplateElements,
    });
  };

  const openAddElementDialog = (categoryId: number) => {
    setNewElement({
      categoryId,
      name: "",
      formula: "",
      labor_formula: "",
      markup_percentage: 10,
    });
    setEditingElementId(null);
    setEditingCategoryId(null);
    setIsElementDialogOpen(true);
  };

  const openEditElementDialog = (element: any, categoryId: number) => {
    setEditingElementId(element.id);
    setEditingCategoryId(categoryId);
    setNewElement({
      categoryId,
      name: element.element.name,
      formula: element.element.formula || element.material_cost.toString(),
      labor_formula: element.element.labor_formula || element.labor_cost.toString(),
      markup_percentage: element.markup || element.markup_percentage || 10,
    });
    setIsElementDialogOpen(true);
  };

  const handleAddElement = () => {
    if (!newElement.categoryId || !newElement.name) return;
    if (editingElementId) {
      const updatedTemplateElements = localProposal.template_elements.map(
        (template) => {
          if (template.id === editingElementId) {
            return {
              ...template,
              element: {
                ...template.element,
                name: newElement.name,
                formula: newElement.formula,
                labor_formula: newElement.labor_formula,
              },
              material_cost: newElement.formula || "0",
              labor_cost: newElement.labor_formula || "0",
              markup: String(newElement.markup_percentage),
            };
          }
          return template;
        }
      );

      userChangeRef.current = true;
      setLocalProposal({
        ...localProposal,
        template_elements: updatedTemplateElements,
      });
    } else {
      const newElementId = Math.random();
      const moduleForElement = localProposal.modules.find(
        (module) => module.id === newElement.categoryId
      );

      if (!moduleForElement) return;

      const newTemplateElement: ProjectElement = {
        id: newElementId,
        element: {
          id: newElementId,
          name: newElement.name,
          description: "",
          created_at: new Date(),
          updated_at: new Date(),
          image: "",
          formula: newElement.formula,
          labor_formula: newElement.labor_formula,
        },
        project_module: {
          id: newElement.categoryId,
          module: moduleForElement,
          created_at: new Date(),
          updated_at: new Date(),
        },
        module: moduleForElement,
        material_cost: newElement.formula || "0",
        labor_cost: newElement.labor_formula || "0",
        markup: String(newElement.markup_percentage),
        quantity: 1,
        total: 0,
        template_elements: []
      };

      userChangeRef.current = true;
      setLocalProposal({
        ...localProposal,
        template_elements: [
          ...localProposal.template_elements,
          newTemplateElement,
        ],
      });
    }

    setNewElement({
      categoryId: null,
      name: "",
      formula: "",
      labor_formula: "",
      markup_percentage: 10,
    });
    setEditingElementId(null);
    setEditingCategoryId(null);
    setIsElementDialogOpen(false);
  };

  const handleRemoveElement = (categoryId: number, elementId: number) => {
    const updatedTemplateElements = localProposal.template_elements.filter(
      (element) => element.id !== elementId
    );

    userChangeRef.current = true;
    setLocalProposal({
      ...localProposal,
      template_elements: updatedTemplateElements,
    });
  };

  // Helper to sync all markups to global if useGlobalMarkup is true
  const syncGlobalMarkup = (proposalObj: ProposalData) => {
    if (!proposalObj.useGlobalMarkup) return proposalObj;
    const globalMarkup = String(proposalObj.globalMarkupPercentage || 15);
    return {
      ...proposalObj,
      template_elements: proposalObj.template_elements.map(el => ({
        ...el,
        markup: globalMarkup,
      }))
    };
  };

  // When continuing to review, sync global markup if needed
  const handleContinue = () => {
    const syncedProposal = syncGlobalMarkup(localProposal);
    if (onUpdateProposal) onUpdateProposal(syncedProposal);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="mb-6 flex flex-col items-center justify-center gap-2">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          Cost Calculation
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">💲</span>
            </TooltipTrigger>
            <TooltipContent>
              <span>Review and customize the calculated costs based on your variable inputs. Adjust markups and see a live summary.</span>
            </TooltipContent>
          </Tooltip>
        </h2>
        <p className="text-base text-gray-500 font-light max-w-2xl">Review and customize the calculated costs based on your variable inputs. Adjust markups and see a live summary.</p>
      </div>
      <Card className="rounded-2xl shadow-lg border-0 p-12 max-w-[1800px] mx-auto w-full">
        <CardContent className="p-0 space-y-12">
          {/* Category and Element Table Section */}
          <div className="space-y-8">
            {calculatedCosts.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No categories yet. Add a category to get started.
              </div>
            ) : (
              calculatedCosts.map((category) => (
                <Card key={category.id} className="overflow-visible rounded-xl border bg-gray-50 mb-8">
                  <CardContent className="p-8">
                    <div className="flex flex-row items-center justify-between mb-4">
                      <h3 className="text-lg font-bold mt-2 text-gray-800">{category.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => openAddElementDialog(category.id)}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1">
                                <PlusCircleIcon className="h-3.5 w-3.5" />
                                <span>Add Element</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>Add a new element to this category</span>
                            </TooltipContent>
                          </Tooltip>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveCategory(category.id)}
                        >
                          <XCircleIcon className="h-4 w-4" />
                          <span className="sr-only">Remove Category</span>
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="rounded-xl border border-gray-200 bg-white shadow-inner">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow>
                                <TableHead className="w-[250px]">Element</TableHead>
                                <TableHead>Material Cost Formula</TableHead>
                                <TableHead className="text-right">
                                  Material Cost
                                </TableHead>
                                <TableHead>Labor Cost Formula</TableHead>
                                <TableHead className="text-right">Labor Cost</TableHead>
                                <TableHead className="text-right">Base Total</TableHead>
                                <TableHead className="text-right">Markup %</TableHead>
                                <TableHead className="text-right">
                                  Total with Markup
                                </TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {category.elements.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={9} className="h-24 text-center">
                                    <p className="text-muted-foreground">
                                      No elements in this category
                                    </p>
                                    <Button
                                      variant="link"
                                      className="mt-2"
                                      onClick={() => openAddElementDialog(category.id)}
                                    >
                                      Add an element
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                category.elements.map((element) => (
                                  <TableRow key={element.id}>
                                    <TableCell className="font-medium">
                                      {element.element.name}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                      <div className="flex items-center gap-1">
                                        {element.materialFormulaHasErrors && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <AlertCircleIcon className="h-4 w-4 text-destructive" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>
                                                  Formula contains unknown variables
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                        <span
                                          className={
                                            element.materialFormulaHasErrors
                                              ? "text-destructive"
                                              : "text-muted-foreground"
                                          }
                                        >
                                          {element.element.formula ||
                                            element.material_cost}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      ${element.calculatedMaterialCost?.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                      <div className="flex items-center gap-1">
                                        {element.laborFormulaHasErrors && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <AlertCircleIcon className="h-4 w-4 text-destructive" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>
                                                  Formula contains unknown variables
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                        <span
                                          className={
                                            element.laborFormulaHasErrors
                                              ? "text-destructive"
                                              : "text-muted-foreground"
                                          }
                                        >
                                          {element.element.labor_formula ||
                                            element.labor_cost}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      ${element.calculatedLaborCost?.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      $
                                      {(
                                        (element.calculatedMaterialCost || 0) +
                                        (element.calculatedLaborCost || 0)
                                      ).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {element.markupPercentage}%
                                      {localProposal.useGlobalMarkup && (
                                        <div className="text-xs text-muted-foreground">
                                          (Global)
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium font-mono">
                                      ${element.totalWithMarkup?.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                            openEditElementDialog(element, category.id)
                                          }
                                        >
                                          <PencilIcon className="h-4 w-4" />
                                          <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                          onClick={() =>
                                            handleRemoveElement(category.id, element.id)
                                          }
                                        >
                                          <XCircleIcon className="h-4 w-4" />
                                          <span className="sr-only">Remove</span>
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add Category Dialog */}
          <div className="flex justify-center">
            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={setIsCategoryDialogOpen}
            >
              <DialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <PlusCircleIcon className="h-4 w-4" /> Add Category
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Add a new category to organize your cost elements</span>
                  </TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category to organize your cost elements
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      placeholder="e.g., Plumbing"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCategoryDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Element Dialog */}
          <ElementDialog
            isOpen={isElementDialogOpen}
            onOpenChange={setIsElementDialogOpen}
            element={newElement}
            onChange={setNewElement}
            onSave={handleAddElement}
            onCancel={() => setIsElementDialogOpen(false)}
            parameters={localProposal.parameters}
            isEditing={!!editingElementId}
          />
        </CardContent>
      </Card>

      {/* Cost Summary Card */}
      <Card className="overflow-hidden border-primary/20 bg-muted/20 rounded-2xl shadow-lg">
        <CardContent>
          <h3 className="text-lg font-bold flex items-center mb-4 mt-4">
            <DollarSignIcon className="h-5 w-5 mr-2" />
            Cost Summary
          </h3>

          {/* Global Markup Control Section */}
          <div className="mb-4 p-3 bg-background rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="use-global-markup">Use Global Markup</Label>
                <Switch
                  id="use-global-markup"
                  checked={localProposal.useGlobalMarkup}
                  onCheckedChange={(checked) => {
                    userChangeRef.current = true;
                    setLocalProposal({
                      ...localProposal,
                      useGlobalMarkup: checked,
                    });
                  }}
                />
              </div>

              {localProposal.useGlobalMarkup && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="global-markup-percentage">
                    Global Markup %:
                  </Label>
                  <Input
                    id="global-markup-percentage"
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 h-8"
                    value={localProposal.globalMarkupPercentage || 15}
                    onChange={(e) => {
                      userChangeRef.current = true;
                      setLocalProposal({
                        ...localProposal,
                        globalMarkupPercentage: Number(e.target.value),
                      });
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {localProposal.useGlobalMarkup
                ? "Using the same markup percentage for all elements"
                : "Each element has its own markup percentage"}
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Material Cost</span>
              <span className="font-mono font-medium flex items-center gap-1 text-lg">
                ${totalMaterialCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Labor Cost</span>
              <span className="font-mono font-medium flex items-center gap-1 text-lg">
                ${totalLaborCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Markup</span>
              <span className="font-mono font-medium flex items-center gap-1 text-lg">
                ${totalMarkupAmount.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-medium">Grand Total</span>
              <span className="text-2xl font-mono font-bold flex items-center gap-1">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleContinue} className="gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-black text-white hover:bg-gray-900 shadow-md">
              Preview Proposal <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <span>Review your proposal before finalizing</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}