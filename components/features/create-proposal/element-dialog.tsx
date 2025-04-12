import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Label,
  Input,
} from "@/components/shared";
import { FormulaBuilder } from "./formula-builder";

export function ElementDialog({
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
