import React from "react";
import { PlusCircleIcon } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared";
import { AddVariableProps } from "@/types/create-proposal";

export default function AddVariable({
  newVariable,
  setNewVariable,
  handleAddVariable,
  isDialogOpen,
  setIsDialogOpen,
}: AddVariableProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircleIcon className="h-4 w-4" /> Add Variable
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Variable</DialogTitle>
          <DialogDescription>
            Create a new variable to use in your cost calculations
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="variable-name">Variable Name</Label>
            <Input
              id="variable-name"
              value={newVariable.name}
              onChange={(e) =>
                setNewVariable({ ...newVariable, name: e.target.value })
              }
              placeholder="e.g., Room Height"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="variable-type">Variable Type</Label>
            <div className="flex gap-2">
              <Select
                value={newVariable.type}
                onValueChange={(value) =>
                  setNewVariable({ ...newVariable, type: value })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Linear Feet">Linear Feet</SelectItem>
                  <SelectItem value="Square Feet">Square Feet</SelectItem>
                  <SelectItem value="Cubic Feet">Cubic Feet</SelectItem>
                  <SelectItem value="Count">Count</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Or enter custom type"
                onChange={(e) => {
                  if (e.target.value) {
                    setNewVariable({
                      ...newVariable,
                      type: e.target.value,
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="variable-value">Initial Value</Label>
            <Input
              id="variable-value"
              value={newVariable.value}
              onChange={(e) =>
                setNewVariable({ ...newVariable, value: e.target.value })
              }
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddVariable}>Add Variable</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
