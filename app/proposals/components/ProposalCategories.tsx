"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ElementValue, categoryApi } from "@/app/api/apiService";
import { slideUp } from "@/app/templates/utils/template-utils";

// Form schema for category
const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.coerce.number().int().min(0, { message: "Position must be a non-negative number" })
});

interface Category {
  id: number;
  name: string;
  position: number;
  elements?: ElementValue[];
}

interface ProposalCategoriesProps {
  categories: Category[];
  proposalId: number;
  onRefresh: () => Promise<void>;
}

export function ProposalCategories({ 
  categories, 
  proposalId, 
  onRefresh 
}: ProposalCategoriesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number>(0);
  const [deleteCategoryName, setDeleteCategoryName] = useState("");

  const categoryForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      position: categories.length // Default to the end of the list
    },
  });

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategoryId(category.id);
      categoryForm.reset({
        name: category.name,
        position: category.position || 0
      });
    } else {
      // Find the highest position and add 1
      const maxPosition = categories.length > 0 
        ? Math.max(...categories.map(c => c.position || 0), 0) 
        : 0;
      
      setEditingCategoryId(null);
      categoryForm.reset({
        name: "",
        position: maxPosition + 1
      });
    }
    setCategoryDialogOpen(true);
  };

  const confirmDeleteCategory = (id: number, name: string) => {
    setDeleteCategoryId(id);
    setDeleteCategoryName(name);
    setDeleteDialogOpen(true);
  };

  // Improved category creation/update handling with position
// Fix the unused newCategory variable
const handleCategorySubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      setIsSubmitting(true);
      
      if (editingCategoryId) {
        // Update existing category with position
        await categoryApi.update(editingCategoryId, {
          name: data.name,
          position: data.position
        });
        
        toast.success("Category updated successfully");
      } else {
        // First, create the category directly
        await categoryApi.createForProposal(proposalId, {
          name: data.name,
          position: data.position
        });
        
        // Then create a placeholder element to ensure it shows up in the UI
        await categoryApi.ensureCategoryVisibility(
          proposalId, 
          data.name,
          data.position
        );
        
        toast.success("Category added successfully");
      }
      
      setCategoryDialogOpen(false);
      await onRefresh();
    } catch (error) {
      toast.error(`Failed to save category: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    
    try {
      setIsSubmitting(true);
      
      await categoryApi.delete(deleteCategoryId);
      
      toast.success("Category deleted successfully");
      setDeleteDialogOpen(false);
      await onRefresh();
    } catch (error) {
      toast.error(`Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Make sure we sort by position for display
  const sortedCategories = [...categories].sort((a, b) => a.position - b.position);

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2.5">
              <div className="bg-purple-50 dark:bg-purple-900/30 p-1.5 rounded-md">
                <FolderKanban className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
              <span>Categories</span>
              <Badge
                variant="secondary"
                className="ml-1 text-xs font-normal"
              >
                {categories.length}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCategoryDialog()}
              className="h-8 gap-1 px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/10">
              <FolderKanban className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">
                No categories added yet
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-[240px] text-center">
                Categories help organize your proposal elements
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCategoryDialog()}
                className="mt-5"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              <AnimatePresence>
                {sortedCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center border p-3.5 rounded-lg bg-card hover:bg-muted/5 transition-colors"
                    variants={slideUp}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {/* Category info column */}
                    <div className="flex flex-col sm:col-span-2">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Position: {category.position}
                      </div>
                    </div>
                    
                    {/* Elements count column */}
                    <div className="hidden sm:block">
                      <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100">
                        {/* Count actual elements, not placeholders */}
                        {(category.elements?.filter(e => 
                          e.element_name !== "__category_placeholder__" && 
                          e.element_name !== "Category Placeholder"
                        )?.length || 0) + " elements"}
                      </Badge>
                    </div>
                    
                    {/* Actions column */}
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                        onClick={() => openCategoryDialog(category)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                        onClick={() => confirmDeleteCategory(
                          category.id,
                          category.name
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategoryId
                ? "Update the details for this category."
                : "Categories help organize your proposal elements."}
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form
              onSubmit={categoryForm.handleSubmit(handleCategorySubmit)}
              className="space-y-4"
            >
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Flooring" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive name for this category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={categoryForm.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value, 10);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Controls the display order of this category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingCategoryId
                        ? "Update Category"
                        : "Add Category"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteCategoryName}&rdquo;? This may also affect elements within this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}