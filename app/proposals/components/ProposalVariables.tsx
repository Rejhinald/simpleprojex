"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Variable as VariableIcon,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { 
  VariableValue, 
  variableApi
} from "@/app/api/apiService";
import { slideUp } from "@/app/templates/utils/template-utils";

// Variable type component for showing the type badge
const VariableType = ({ type }: { type: string }) => {
  const typeMap: Record<string, { label: string; color: string; unit: string }> = {
    LINEAR_FEET: { 
      label: "Linear Feet", 
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", 
      unit: "ft"
    },
    SQUARE_FEET: { 
      label: "Square Feet", 
      color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400", 
      unit: "sq ft"
    },
    CUBIC_FEET: { 
      label: "Cubic Feet", 
      color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", 
      unit: "cu ft"
    },
    COUNT: { 
      label: "Count", 
      color: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400", 
      unit: ""
    },
  };

  const { label, color } = typeMap[type] || {
    label: type,
    color: "bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
    unit: ""
  };

  return (
    <Badge variant="outline" className={`${color}`}>
      {label}
    </Badge>
  );
};

// Get unit symbol based on variable type
const getUnitSymbol = (type: string): string => {
  const unitMap: Record<string, string> = {
    LINEAR_FEET: "ft",
    SQUARE_FEET: "sq ft",
    CUBIC_FEET: "cu ft",
    COUNT: ""
  };
  
  return unitMap[type] || "";
};

// Form schema for all variable fields
const variableSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(["LINEAR_FEET", "SQUARE_FEET", "CUBIC_FEET", "COUNT"]),
  value: z.coerce.number().default(0)
});

interface ProposalVariablesProps {
  proposalId: number;
  variables: VariableValue[];
  onRefresh: () => Promise<void>;
}

export function ProposalVariables({ proposalId, variables, onRefresh }: ProposalVariablesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingVariableId, setEditingVariableId] = useState<number | null>(null);
  const [deleteVariableId, setDeleteVariableId] = useState<number>(0);
  const [deleteVariableName, setDeleteVariableName] = useState("");

  const variableForm = useForm<z.infer<typeof variableSchema>>({
    resolver: zodResolver(variableSchema),
    defaultValues: {
      name: "",
      type: "SQUARE_FEET",
      value: 0
    },
  });

  const openVariableDialog = (variable?: VariableValue) => {
    if (variable) {
      setEditingVariableId(variable.variable_id);
      variableForm.reset({
        name: variable.variable_name || "",
        type: (variable.variable_type as "LINEAR_FEET" | "SQUARE_FEET" | "CUBIC_FEET" | "COUNT") || "SQUARE_FEET",
        value: variable.value
      });
    } else {
      setEditingVariableId(null);
      variableForm.reset({
        name: "",
        type: "SQUARE_FEET",
        value: 0
      });
    }
    setVariableDialogOpen(true);
  };

  const confirmDeleteVariable = (id: number, name: string) => {
    setDeleteVariableId(id);
    setDeleteVariableName(name || `Variable #${id}`);
    setDeleteDialogOpen(true);
  };

  // Updated to use the new API methods
  const handleVariableSubmit = async (data: z.infer<typeof variableSchema>) => {
    if (!data.name || !data.type) {
      toast.error("Variable name and type are required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingVariableId) {
        // For existing variables, use the comprehensive update method
        await variableApi.updateVariableWithValue(proposalId, editingVariableId, {
          name: data.name,
          type: data.type, 
          value: data.value
        });
        
        toast.success("Variable updated successfully");
      } else {
        // For new variables, use the creation method
        await variableApi.createVariableInProposal(proposalId, {
          name: data.name,
          type: data.type,
          value: data.value
        });
        
        toast.success("Variable added successfully");
      }
      
      setVariableDialogOpen(false);
      await onRefresh();
    } catch (error) {
      toast.error(`Failed to save variable: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated to use the new API method
  const handleDeleteVariable = async () => {
    if (!deleteVariableId) return;
    
    try {
      setIsSubmitting(true);
      
      // Use the deleteVariable method from the API
      await variableApi.delete(deleteVariableId);
      
      toast.success("Variable deleted successfully");
      setDeleteDialogOpen(false);
      await onRefresh();
    } catch (error) {
      toast.error(`Failed to delete variable: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2.5">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-md">
                <VariableIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <span>Variables</span>
              <Badge
                variant="secondary"
                className="ml-1 text-xs font-normal"
              >
                {variables.length}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openVariableDialog()}
              className="h-8 gap-1 px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          {variables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/10">
              <VariableIcon className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">
                No variables added yet
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-[240px] text-center">
                Variables allow you to parameterize your proposal
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openVariableDialog()}
                className="mt-5"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Variable
              </Button>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              <AnimatePresence>
                {variables.map((variable) => (
                  <motion.div
                    key={variable.variable_id}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center border p-3.5 rounded-lg bg-card hover:bg-muted/5 transition-colors"
                    variants={slideUp}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {/* Variable info column */}
                    <div className="flex flex-col">
                      <div className="font-medium">{variable.variable_name}</div>
                      <VariableType type={variable.variable_type || "COUNT"} />
                    </div>
                    
                    {/* Value column - simple display, no editing inline */}
                    <div className="sm:col-span-2">
                      <div className="py-2 px-3 rounded-md border bg-muted/30">
                        <span className="font-medium">
                          {variable.value.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2
                          })}
                          {variable.variable_type && (
                            <span className="ml-1 text-muted-foreground text-sm">
                              {getUnitSymbol(variable.variable_type)}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions column */}
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                        onClick={() => openVariableDialog(variable)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                        onClick={() => confirmDeleteVariable(
                          variable.variable_id,
                          variable.variable_name || ""
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

      {/* Variable Dialog */}
      <Dialog open={variableDialogOpen} onOpenChange={setVariableDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingVariableId ? "Edit Variable" : "Add Variable"}
            </DialogTitle>
            <DialogDescription>
              {editingVariableId
                ? "Update the details for this variable."
                : "Variables allow you to parameterize your proposal."}
            </DialogDescription>
          </DialogHeader>
          <Form {...variableForm}>
            <form
              onSubmit={variableForm.handleSubmit(handleVariableSubmit)}
              className="space-y-4"
            >
              {/* Always show name and type fields, even when editing */}
              <FormField
                control={variableForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room Size" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive name for this variable.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={variableForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SQUARE_FEET">Square Feet</SelectItem>
                        <SelectItem value="LINEAR_FEET">Linear Feet</SelectItem>
                        <SelectItem value="CUBIC_FEET">Cubic Feet</SelectItem>
                        <SelectItem value="COUNT">Count</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This defines the unit of measurement for this variable.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={variableForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      The current value for this variable.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVariableDialogOpen(false)}
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
                      {editingVariableId
                        ? "Update Variable"
                        : "Add Variable"}
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
            <AlertDialogTitle>Delete Variable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteVariableName}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteVariable}
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