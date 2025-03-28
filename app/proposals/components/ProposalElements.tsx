"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, List, Plus, LayoutList } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { ElementValue, proposalApi, UpdateElementValueRequest, elementApi } from "@/app/api/apiService";
import { ElementCategory } from "./ElementCategory";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24,
      duration: 0.4 
    }
  }
};

// Form schema for element editing - updated to include name, category, and position
const elementEditSchema = z.object({
  element_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category_name: z.string().min(1, { message: "Category is required" }),
  calculated_material_cost: z.coerce.number().min(0),
  calculated_labor_cost: z.coerce.number().min(0),
  markup_percentage: z.coerce.number().min(0).max(100),
  position: z.coerce.number().int().min(0)
});

// Form schema for creating new element
const elementCreateSchema = z.object({
  element_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category_name: z.string().min(1, { message: "Category is required" }),
  material_cost: z.string().min(1, { message: "Material cost is required" }),
  labor_cost: z.string().min(1, { message: "Labor cost is required" }),
  markup_percentage: z.coerce.number().min(0).max(100),
  position: z.coerce.number().int().min(0)
});

interface ProposalElementsProps {
  elementValues: ElementValue[];
  proposalId: number;
  onRefresh: () => Promise<void>;
}

export function ProposalElements({ 
    elementValues, 
    proposalId,
    onRefresh
  }: ProposalElementsProps) {
    const [editingElementId, setEditingElementId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [elementToDelete, setElementToDelete] = useState<{id: number, name: string} | null>(null);
    const [newElementDialogOpen, setNewElementDialogOpen] = useState(false);
    const [editingElement, setEditingElement] = useState<ElementValue | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Calculate totals for each category - restored as we need this for the ElementCategory component
  const categoryTotals = elementValues.reduce((acc, element) => {
    const categoryName = element.category_name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = {
        materialCost: 0,
        laborCost: 0,
        totalWithMarkup: 0,
        elementCount: 0,
        categoryId: element.category_id
      };
    }
    
    acc[categoryName].materialCost += parseFloat(element.calculated_material_cost) || 0;
    acc[categoryName].laborCost += parseFloat(element.calculated_labor_cost) || 0;
    acc[categoryName].totalWithMarkup += element.total_with_markup || 0;
    acc[categoryName].elementCount += 1;
    
    return acc;
  }, {} as Record<string, { 
    materialCost: number; 
    laborCost: number; 
    totalWithMarkup: number; 
    elementCount: number;
    categoryId?: number;
  }>);
  
  // Group elements by category
  const elementsByCategory = elementValues.reduce((acc, element) => {
    const categoryName = element.category_name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(element);
    return acc;
  }, {} as Record<string, ElementValue[]>);
  
  // Extract all categories for the dropdown
  // Filter out any categories with name "Uncategorized" to avoid showing in dropdown
  const categories = Object.entries(elementsByCategory)
    .filter(([name]) => name !== "Uncategorized")
    .map(([name, elements]) => ({
      name,
      id: elements[0].category_id,
      elementCount: elements.length,
      position: elements[0].category_position || 0
    }));
  
  // Form for editing element - updated with new fields
  const elementEditForm = useForm<z.infer<typeof elementEditSchema>>({
    resolver: zodResolver(elementEditSchema),
    defaultValues: {
      element_name: "",
      category_name: "",
      calculated_material_cost: 0,
      calculated_labor_cost: 0,
      markup_percentage: 20,
      position: 0
    },
  });
  
  // Form for creating a new element
  const elementCreateForm = useForm<z.infer<typeof elementCreateSchema>>({
    resolver: zodResolver(elementCreateSchema),
    defaultValues: {
      element_name: "",
      category_name: "",
      material_cost: "0",
      labor_cost: "0",
      markup_percentage: 20,
      position: 0
    },
  });
  
  // Open edit dialog for an element - updated to set all fields
  const openEditDialog = (element: ElementValue) => {
    setEditingElementId(element.element_id);
    setEditingElement(element);
    
    // Make sure to reset the form with all the values
    elementEditForm.reset({
      element_name: element.element_name || `Element #${element.element_id}`,
      category_name: element.category_name || "",
      calculated_material_cost: parseFloat(element.calculated_material_cost) || 0,
      calculated_labor_cost: parseFloat(element.calculated_labor_cost) || 0,
      markup_percentage: parseFloat(element.markup_percentage) || 0,
      position: element.position || 0
    });
  };
  
  // Calculate the next position for a category
  const getNextPositionForCategory = (categoryName: string) => {
    // Filter elements by the selected category
    const categoryElements = elementValues.filter(
      el => el.category_name === categoryName && 
            el.element_name !== "__category_placeholder__" &&
            el.element_name !== "Category Placeholder"
    );
    
    if (categoryElements.length === 0) {
      return 1; // Default to position 1 if no elements
    }
    
    // Find highest position and add 1
    const maxPosition = Math.max(...categoryElements.map(e => e.position || 0));
    return maxPosition + 1;
  };
  
  // Open new element dialog
  const openNewElementDialog = () => {
    // Get default category - ensure we have categories available
    if (categories.length === 0) {
      toast.error("You need to create a category first before adding elements");
      return;
    }
    
    const defaultCategory = categories[0].name;
    
    // Calculate next position for this category
    const nextPosition = getNextPositionForCategory(defaultCategory);
    
    // Set selected category for position calculations
    setSelectedCategory(defaultCategory);
    
    // Reset the form with default values
    elementCreateForm.reset({
      element_name: "",
      category_name: defaultCategory,
      material_cost: "0",
      labor_cost: "0",
      markup_percentage: 20,
      position: nextPosition
    });
    
    setNewElementDialogOpen(true);
  };
  
  useEffect(() => {
    const subscription = elementCreateForm.watch((value, { name }) => {
      if (name === 'category_name' && value.category_name && value.category_name !== selectedCategory) {
        // Category changed, update position
        const newPosition = getNextPositionForCategory(value.category_name);
        elementCreateForm.setValue('position', newPosition);
        setSelectedCategory(value.category_name);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [elementCreateForm, selectedCategory, elementValues]);
  
  // Handle element update form submission - updated to include all fields
  const handleElementEditSubmit = async (data: z.infer<typeof elementEditSchema>) => {
    if (editingElementId === null || !editingElement) return;
    
    try {
      setIsSubmitting(true);
      
      // Ensure we're working with the right types
      const materialCost = parseFloat(data.calculated_material_cost.toString());
      const laborCost = parseFloat(data.calculated_labor_cost.toString());
      const markupPercentage = parseFloat(data.markup_percentage.toString());
      
      // Log what we're trying to update
      console.log('Updating element:', {
        id: editingElementId,
        from: {
          name: editingElement.element_name,
          category: editingElement.category_name,
          position: editingElement.position
        },
        to: {
          name: data.element_name,
          category: data.category_name,
          position: data.position
        }
      });
      
      // Always send ALL parameters, even if unchanged
      const requestData: UpdateElementValueRequest[] = [{
        element_id: editingElementId,
        element_name: data.element_name,
        category_name: data.category_name,
        calculated_material_cost: materialCost,
        calculated_labor_cost: laborCost,
        markup_percentage: markupPercentage,
        position: data.position
      }];
      
      const result = await proposalApi.updateElementValues(proposalId, requestData);
      console.log('Update result:', result);
      
      toast.success("Element updated successfully");
      setEditingElementId(null);
      setEditingElement(null);
      
      // Ensure we reload data after update
      await onRefresh();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(`Failed to update element: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  // Handle new element creation - now passing position
  const handleElementCreateSubmit = async (data: z.infer<typeof elementCreateSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Ensure we have the right types
      const materialCost = parseFloat(data.material_cost);
      const laborCost = parseFloat(data.labor_cost);
      const markupPercentage = parseFloat(data.markup_percentage.toString());
      
      // Create the element with all parameters specified
      const requestData: UpdateElementValueRequest[] = [{
        element_id: -1, // Negative ID signals a new element
        element_name: data.element_name,
        category_name: data.category_name,
        calculated_material_cost: materialCost,
        calculated_labor_cost: laborCost,
        markup_percentage: markupPercentage,
        position: data.position,
        category_position: categories.find(c => c.name === data.category_name)?.position || 0
      }];
      
      console.log('Creating element:', requestData);
      
      await proposalApi.updateElementValues(proposalId, requestData);
      
      toast.success("Element created successfully");
      setNewElementDialogOpen(false);
      
      // Ensure we reload data after creation
      await onRefresh();
    } catch (error) {
      console.error('Create error:', error);
      toast.error(`Failed to create element: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Extract categories for display with proper sorting
  const categoriesForDisplay = Object.entries(elementsByCategory).map(([name, elements]) => {
    // Sort elements by position
    const sortedElements = [...elements].sort((a, b) => 
      (a.position || 0) - (b.position || 0)
    );
    
    return {
      id: elements[0].category_id || 0,
      name,
      position: elements[0].category_position || 0,
      elements: sortedElements, // Use sorted elements
      totals: categoryTotals[name]
    };
  }).sort((a, b) => a.position - b.position); // Sort categories by position

  // Confirm deletion of an element
  const confirmDelete = (element: ElementValue) => {
    setElementToDelete({
      id: element.element_id,
      name: element.element_name || `Element #${element.element_id}`
    });
    setDeleteDialogOpen(true);
  };
  
  // Handle element deletion
  const handleDelete = async () => {
    if (!elementToDelete) return;
    
    try {
      setIsSubmitting(true);
      
      await elementApi.delete(elementToDelete.id);
      
      toast.success(`Element "${elementToDelete.name}" deleted`);
      setDeleteDialogOpen(false);
      setElementToDelete(null);
      onRefresh();
    } catch (error) {
      toast.error(`Failed to delete element: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If no elements, show empty state with add button
  if (elementValues.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-md">
                  <List className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <span>Elements</span>
                <Badge variant="secondary" className="ml-1 text-xs font-normal">0</Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={openNewElementDialog}
                className="h-8 gap-1 px-3"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <motion.div 
              className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/10"
              variants={slideUp}
              initial="hidden"
              animate="visible"
            >
              <List className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No elements available</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-md text-center">
                This proposal has no elements. Add elements or sync with a template.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={openNewElementDialog}
                className="mt-5"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Element
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-md">
                  <LayoutList className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <span>Elements</span>
                <Badge variant="secondary" className="ml-1 text-xs font-normal">
                  {elementValues.length}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={openNewElementDialog}
                className="h-8 gap-1 px-3"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5 space-y-6">
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 0.1, staggerChildren: 0.05 }}
            >
              <ElementCategory 
                categories={categoriesForDisplay}
                proposalId={proposalId}
                onRefresh={onRefresh}
                onEditElement={openEditDialog}
                onDeleteElement={confirmDelete}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Edit Element Dialog - Updated with name and category fields */}
      <Dialog open={editingElementId !== null} onOpenChange={(open) => !open && setEditingElementId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Element</DialogTitle>
            <DialogDescription>
              Update the details for this element.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...elementEditForm}>
            <form onSubmit={elementEditForm.handleSubmit(handleElementEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={elementEditForm.control}
                name="element_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Element Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hardwood Flooring" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this element.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={elementEditForm.control}
                name="category_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The category this element belongs to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={elementEditForm.control}
                  name="calculated_material_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Cost</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={elementEditForm.control}
                  name="calculated_labor_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Labor Cost</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={elementEditForm.control}
                  name="markup_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Markup Percentage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={elementEditForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Display order within the category.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingElementId(null)}
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
                      Update Element
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* New Element Dialog */}
      <Dialog open={newElementDialogOpen} onOpenChange={setNewElementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Element</DialogTitle>
            <DialogDescription>
              Create a new element in your proposal.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...elementCreateForm}>
            <form onSubmit={elementCreateForm.handleSubmit(handleElementCreateSubmit)} className="space-y-4 py-4">
              <FormField
                control={elementCreateForm.control}
                name="element_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Element Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hardwood Flooring" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this element.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={elementCreateForm.control}
                name="category_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The category this element belongs to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={elementCreateForm.control}
                  name="material_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Cost Formula</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 50 or roomSize * 5" {...field} />
                      </FormControl>
                      <FormDescription>
                        Fixed value or formula using variable names.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={elementCreateForm.control}
                  name="labor_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Labor Cost Formula</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 75 or roomSize * 2.5" {...field} />
                      </FormControl>
                      <FormDescription>
                        Fixed value or formula using variable names.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={elementCreateForm.control}
                  name="markup_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Markup Percentage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={elementCreateForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Display order within the category.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewElementDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Element
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the element &quot;{elementToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
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