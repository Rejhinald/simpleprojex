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

interface AddVariableProps {
  newParameter: { name: string; type: string; value: string };
  setNewParameter: (param: { name: string; type: string; value: string }) => void;
  handleAddParameter: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

export default function AddVariable({
  newParameter,
  setNewParameter,
  handleAddParameter,
  isDialogOpen,
  setIsDialogOpen,
}: AddVariableProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-lg px-4 py-2 text-base font-semibold data-[state=open]:bg-white data-[state=open]:shadow-sm data-[state=open]:text-black text-gray-500 transition-all">
          <PlusCircleIcon className="h-4 w-4" /> Add New Variable
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold">Add New Variable</DialogTitle>
          <DialogDescription className="text-gray-500 text-base">
            Create a new variable to use in your cost calculations.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddParameter();
          }}
          className="p-6 space-y-6"
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="variable-name">Variable Name</Label>
              <Input
                id="variable-name"
                value={newParameter.name}
                onChange={e => setNewParameter({ ...newParameter, name: e.target.value })}
                placeholder="e.g., Room Height"
                className="rounded-lg text-base"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="variable-type">Variable Type</Label>
              <Select
                value={newParameter.type}
                onValueChange={value => setNewParameter({ ...newParameter, type: value })}
                required
              >
                <SelectTrigger className="rounded-lg text-base w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Linear Feet">Linear Feet</SelectItem>
                  <SelectItem value="Square Feet">Square Feet</SelectItem>
                  <SelectItem value="Cubic Feet">Cubic Feet</SelectItem>
                  <SelectItem value="Count">Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="variable-value">Initial Value</Label>
              <Input
                id="variable-value"
                value={newParameter.value}
                onChange={e => setNewParameter({ ...newParameter, value: e.target.value })}
                placeholder="0"
                className="rounded-lg text-base"
                type="number"
                min="0"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="rounded-lg px-4 py-2 text-base font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg px-4 py-2 text-base font-semibold bg-black text-white hover:bg-gray-900 shadow-md">
              Add Variable
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
