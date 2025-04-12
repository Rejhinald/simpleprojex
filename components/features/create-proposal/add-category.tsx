import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Label,
  Input,
} from "@/components/shared";
import { PlusCircleIcon } from "lucide-react";

interface AddCategoryProps {
  isCategoryDialogOpen: boolean;
  setIsCategoryDialogOpen: (isOpen: boolean) => void;
  newCategory: { name: string };
  setNewCategory: (category: { name: string }) => void;
  handleAddCategory: () => void;
}

export default function AddCategory({
  isCategoryDialogOpen,
  setIsCategoryDialogOpen,
  newCategory,
  setNewCategory,
  handleAddCategory,
}: AddCategoryProps) {
  // Ensure newCategory is never undefined with a default value
  const category = newCategory || { name: "" };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory({ ...category, name: e.target.value });
  };

  return (
    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
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
              value={category.name || ""}
              onChange={handleChange}
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
          <Button
            onClick={handleAddCategory}
            disabled={!category.name || category.name.trim() === ""}
          >
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
