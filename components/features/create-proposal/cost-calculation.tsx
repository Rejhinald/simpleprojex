"use client";

import { useMemo, useState, useEffect } from "react";
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
import type { ProposalData, Category, Element } from "@/types/proposals";
import { calculateCost } from "@/helpers/calculate-cost";
import {
  ArrowRightIcon,
  DollarSignIcon,
  PlusCircleIcon,
  XCircleIcon,
  PencilIcon,
  AlertCircleIcon,
} from "lucide-react";
import { FormulaBuilder } from "./formula-builder";
import { CostCalculationProps } from "@/types/create-proposal";
import { checkFormulaErrors } from "@/helpers/calculate-cost";

// Extracted ElementDialog component
function ElementDialog({
  isOpen,
  onOpenChange,
  element,
  onChange,
  onSave,
  onCancel,
  variables,
  isEditing,
}) {
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
              variables={variables}
              value={element.material_cost}
              onChange={(value) =>
                onChange({ ...element, material_cost: value })
              }
              placeholder="e.g., Wall Length * Wall Width * Paint Cost"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="labor-cost">Labor Cost Formula</Label>
            <FormulaBuilder
              variables={variables}
              value={element.labor_cost}
              onChange={(value) => onChange({ ...element, labor_cost: value })}
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
    material_cost: string;
    labor_cost: string;
    markup_percentage: number;
  }>({
    categoryId: null,
    name: "",
    material_cost: "",
    labor_cost: "",
    markup_percentage: 10,
  });
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isElementDialogOpen, setIsElementDialogOpen] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );

  useEffect(() => {
    setLocalProposal(proposal);
  }, [proposal]);

  useEffect(() => {
    if (onUpdateProposal) {
      onUpdateProposal(localProposal);
    }
  }, [localProposal, onUpdateProposal]);

  const calculatedCosts = useMemo(() => {
    // Map template_elements to their respective categories
    const elementsByCategory = localProposal.template_elements.reduce(
      (acc, templateElement) => {
        const categoryId = templateElement.module.id;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(templateElement);
        return acc;
      },
      {} as Record<number, typeof localProposal.template_elements>
    );

    return localProposal.modules.map((category) => {
      const elements = elementsByCategory[category.id] || [];
      return {
        ...category,
        elements: elements.map((templateElement) => {
          const materialFormulaHasErrors = checkFormulaErrors(
            templateElement.material_cost.toString(),
            localProposal.parameters
          );

          const laborFormulaHasErrors = checkFormulaErrors(
            templateElement.labor_cost.toString(),
            localProposal.parameters
          );

          const materialCost = materialFormulaHasErrors
            ? 0
            : calculateCost(
                templateElement.material_cost.toString(),
                localProposal.parameters
              );

          const laborCost = laborFormulaHasErrors
            ? 0
            : calculateCost(
                templateElement.labor_cost.toString(),
                localProposal.parameters
              );

          const baseCost = materialCost + laborCost;
          const markupPercentage = localProposal.useGlobalMarkup
            ? localProposal.globalMarkupPercentage || 15
            : templateElement.markup_percentage || 10;

          const markupAmount = baseCost * (markupPercentage / 100);

          return {
            ...templateElement,
            materialFormulaHasErrors,
            laborFormulaHasErrors,
            calculatedMaterialCost: materialCost,
            calculatedLaborCost: laborCost,
            markupPercentage,
            markupAmount,
            totalWithMarkup: baseCost + markupAmount,
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
    };

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

    // Also remove all template_elements associated with this category
    const updatedTemplateElements = localProposal.template_elements.filter(
      (element) => element.module.id !== categoryId
    );

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
      material_cost: "",
      labor_cost: "",
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
      material_cost: element.material_cost,
      labor_cost: element.labor_cost,
      markup_percentage: element.markup_percentage,
    });
    setIsElementDialogOpen(true);
  };

  const handleAddElement = () => {
    if (!newElement.categoryId || !newElement.name) return;

    if (editingElementId) {
      // Update existing element
      const updatedTemplateElements = localProposal.template_elements.map(
        (template) => {
          if (template.id === editingElementId) {
            return {
              ...template,
              element: {
                ...template.element,
                name: newElement.name,
              },
              material_cost: newElement.material_cost,
              labor_cost: newElement.labor_cost,
              markup_percentage: newElement.markup_percentage,
            };
          }
          return template;
        }
      );

      setLocalProposal({
        ...localProposal,
        template_elements: updatedTemplateElements,
      });
    } else {
      // Add new element
      const newElementId = Math.random().toString(36).substring(2, 9);

      const newTemplateElement = {
        id: newElementId,
        module: { id: newElement.categoryId },
        element: {
          id: newElementId,
          name: newElement.name,
        },
        material_cost: newElement.material_cost,
        labor_cost: newElement.labor_cost,
        markup_percentage: newElement.markup_percentage,
      };

      setLocalProposal({
        ...localProposal,
        template_elements: [
          ...localProposal.template_elements,
          newTemplateElement,
        ],
      });
    }

    // Reset state
    setNewElement({
      categoryId: null,
      name: "",
      material_cost: "",
      labor_cost: "",
      markup_percentage: 10,
    });
    setEditingElementId(null);
    setEditingCategoryId(null);
    setIsElementDialogOpen(false);
  };

  const handleRemoveElement = (categoryId: number, elementId: string) => {
    const updatedTemplateElements = localProposal.template_elements.filter(
      (element) => element.id !== elementId
    );

    setLocalProposal({
      ...localProposal,
      template_elements: updatedTemplateElements,
    });
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Cost Calculation</h3>
          <p className="text-sm text-muted-foreground">
            Review and customize the calculated costs based on your variable
            inputs
          </p>
        </div>
        <Dialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <PlusCircleIcon className="h-4 w-4" /> Add Category
            </Button>
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

      <ElementDialog
        isOpen={isElementDialogOpen}
        onOpenChange={setIsElementDialogOpen}
        element={newElement}
        onChange={setNewElement}
        onSave={handleAddElement}
        onCancel={() => setIsElementDialogOpen(false)}
        variables={localProposal.parameters || []}
        isEditing={!!editingElementId}
      />

      <div className="grid grid-cols-1 gap-6">
        {calculatedCosts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No categories yet. Add a category to get started.
            </p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => setIsCategoryDialogOpen(true)}
            >
              Add a category
            </Button>
          </Card>
        ) : (
          calculatedCosts.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardContent>
                <div className="flex flex-row items-center justify-between mb-4">
                  <h3 className="text-lg font-bold mt-4"> {category.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => openAddElementDialog(category.id)}
                    >
                      <PlusCircleIcon className="h-3.5 w-3.5" />
                      <span>Add Element</span>
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
                                  {element.material_cost}
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
                                  {element.labor_cost}
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
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="overflow-hidden border-primary/20 bg-muted/20">
        <CardContent>
          <h3 className="text-lg font-bold flex items-center mb-4 mt-4">
            <DollarSignIcon className="h-5 w-5" />
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Material Cost</span>
              <span className="font-mono font-medium">
                ${totalMaterialCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Labor Cost</span>
              <span className="font-mono font-medium">
                ${totalLaborCost.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Grand Total</span>
              <span className="text-xl font-mono font-bold">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleContinue} className="gap-2">
          Preview Proposal <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
