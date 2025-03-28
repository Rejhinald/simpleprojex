// CHORE: Take out the components of this page and create reusable components
// CHORE: Make the loader be using the global loader component

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  ArrowLeft,
  Clock,
  Variable as VariableIcon,
  LayoutGrid,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronRight,
  List,
  Save,
  Loader2,
  PieChart,
  Folder,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

import {
  templateApi,
  categoryApi,
  Category,
  Variable,
  Element,
} from "../../api/apiService";

import {
  formatDate,
  slideUp,
  TemplateWithDetails,
} from "../utils/template-utils";

// Form schemas
const variableSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(["LINEAR_FEET", "SQUARE_FEET", "CUBIC_FEET", "COUNT"]),
  variable_value: z.coerce.number().default(0), // Use coerce and provide a default
});

const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.number().int().min(0),
});

const elementSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  material_cost: z
    .string()
    .min(1, { message: "Material cost is required." }),
  labor_cost: z.string().min(1, { message: "Labor cost is required." }),
  markup_percentage: z.number().min(0).max(100),
  position: z.number().int().min(0),
  categoryId: z.number().positive(),
});

// Variable type component
const VariableType = ({ type }: { type: string }) => {
  const typeMap: Record<string, { label: string; color: string }> = {
    LINEAR_FEET: { label: "Linear Feet", color: "bg-blue-50 text-blue-600" },
    SQUARE_FEET: { label: "Square Feet", color: "bg-green-50 text-green-600" },
    CUBIC_FEET: { label: "Cubic Feet", color: "bg-amber-50 text-amber-600" },
    COUNT: { label: "Count", color: "bg-violet-50 text-violet-600" },
  };

  const { label, color } = typeMap[type] || {
    label: type,
    color: "bg-gray-50 text-gray-600",
  };

  return (
    <Badge variant="outline" className={`${color}`}>
      {label}
    </Badge>
  );
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = Number(params.id);
  const loadedCategoriesRef = useRef<Record<number, boolean>>({});

  // State management
  const [template, setTemplate] = useState<TemplateWithDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [categoryElements, setCategoryElements] = useState<
    Record<number, Element[]>
  >({});
  const [activeTab, setActiveTab] = useState("overview");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});
  // Add isLoadingComplete state
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  // Dialog states
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [elementDialogOpen, setElementDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [deleteId, setDeleteId] = useState<number>(0);
  const [deleteName, setDeleteName] = useState("");

  // Current editing item
  const [editingVariableId, setEditingVariableId] = useState<number | null>(
    null
  );
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editingElementId, setEditingElementId] = useState<number | null>(null);

  // Forms
  const templateForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const variableForm = useForm<z.infer<typeof variableSchema>>({
    resolver: zodResolver(variableSchema),
    defaultValues: {
      name: "",
      type: "SQUARE_FEET",
      variable_value: 0, // Always provide a default value of 0
    },
  });

  const categoryForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      position: 0,
    },
  });

  const elementForm = useForm<z.infer<typeof elementSchema>>({
    resolver: zodResolver(elementSchema),
    defaultValues: {
      name: "",
      material_cost: "",
      labor_cost: "",
      markup_percentage: 20,
      position: 0,
      categoryId: 0,
    },
  });

  // Updated loadTemplateData function - key change to dependencies
  const loadTemplateData = useCallback(async (): Promise<void> => {
    try {
      const templateData = await templateApi.getById(templateId);
      const categoriesData = await templateApi.listCategories(templateId);
      const variablesData = await templateApi.listVariables(templateId);

      // Map the API response to include variable_value for form compatibility
      const processedVariables = variablesData.map((variable) => ({
        ...variable,
        variable_value: variable.default_value,
      }));

      setTemplate(templateData);
      setCategories(categoriesData);
      setVariables(processedVariables);

      // Initialize expanded state for categories (but don't create dependency loop)
      const expandedState: Record<number, boolean> = {};
      categoriesData.forEach((category) => {
        // Use the ref to store expanded state instead of the state variable
        expandedState[category.id] =
          loadedCategoriesRef.current[category.id] || false;
      });
      setExpandedCategories(expandedState);

      // If we have categories, set the first one as default for element form
      if (categoriesData.length > 0) {
        elementForm.setValue("categoryId", categoriesData[0].id);
      }

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error(`Failed to load template: ${errorMessage}`);
    }
  }, [templateId, elementForm]); // REMOVED expandedCategories from dependencies

  // Mark loading as complete after data is fetched
  useEffect(() => {
    if (templateId) {
      const timer = setTimeout(() => {
        setIsLoadingComplete(true);
      }, 500); // Give API calls time to complete

      return () => clearTimeout(timer);
    }
  }, [templateId, template, categories, variables]);

  // Load template data on component mount
  useEffect(() => {
    if (!templateId) return;
    loadTemplateData();
  }, [templateId, refreshTrigger, loadTemplateData]);

  // Update template form when template changes
  useEffect(() => {
    if (template) {
      templateForm.reset({
        name: template.name,
        description: template.description || "",
      });
    }
  }, [template, templateForm]);

  // Load elements for all categories - fixed to prevent infinite loop
  useEffect(() => {
    const loadAllCategoryElements = async () => {
      if (!categories.length) return;

      try {
        const newElements: Record<number, Element[]> = { ...categoryElements };
        let hasChanges = false;

        // Only load for categories that haven't been loaded yet
        for (const category of categories) {
          if (!loadedCategoriesRef.current[category.id]) {
            try {
              const elements = await categoryApi.listElements(category.id);
              newElements[category.id] = elements;
              loadedCategoriesRef.current[category.id] = true;
              hasChanges = true;
            } catch (error) {
              console.error(
                `Failed to load elements for category ${category.id}:`,
                error
              );
              newElements[category.id] = [];
              loadedCategoriesRef.current[category.id] = true;
              hasChanges = true;
            }
          }
        }

        if (hasChanges) {
          setCategoryElements(newElements);
        }
      } catch (error) {
        console.error("Failed to load category elements:", error);
      }
    };

    loadAllCategoryElements();
  }, [categories]); // Remove categoryElements from dependency

  useEffect(() => {
    // Signal to parent that navigation is complete
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("route-changed", {
          detail: {
            path: window.location.pathname,
            templateName: template?.name || "Template",
          },
        })
      );
    }
  }, [template]);

  const refresh = () => {
    // Reset loaded categories tracking when refreshing
    loadedCategoriesRef.current = {};
    setRefreshTrigger((prev) => prev + 1);
  };

  // CRUD operations
  const updateTemplate = async (data: {
    name: string;
    description: string;
  }) => {
    try {
      setIsSubmitting(true);
      await templateApi.update(templateId, data);
      toast.success("Template updated successfully");
      refresh();
      setIsEditingTemplate(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to update template: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the handleVariableSubmit function to correctly map variable_value to default_value
  const handleVariableSubmit = async (data: z.infer<typeof variableSchema>) => {
    try {
      setIsSubmitting(true);

      // Transform the data to what the API expects
      const apiData = {
        name: data.name,
        type: data.type,
        default_value: data.variable_value,
      };

      if (editingVariableId) {
        await templateApi.updateVariable(editingVariableId, apiData);
        toast.success("Variable updated successfully");
      } else {
        await templateApi.createVariable(templateId, apiData);
        toast.success("Variable created successfully");
      }
      refresh();
      setVariableDialogOpen(false);
      variableForm.reset({
        name: "",
        type: "SQUARE_FEET",
        variable_value: 0,
      });
      setEditingVariableId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to save variable: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      setIsSubmitting(true);
      if (editingCategoryId) {
        await categoryApi.update(editingCategoryId, data);
        toast.success("Category updated successfully");
      } else {
        await templateApi.createCategory(templateId, data);
        toast.success("Category created successfully");
      }
      refresh();
      setCategoryDialogOpen(false);
      categoryForm.reset({ name: "", position: 0 });
      setEditingCategoryId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to save category: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleElementSubmit = async (data: z.infer<typeof elementSchema>) => {
    try {
      setIsSubmitting(true);
      const { categoryId, ...elementData } = data;

      if (editingElementId) {
        await categoryApi.updateElement(editingElementId, elementData);
        toast.success("Element updated successfully");
      } else {
        await categoryApi.createElement(categoryId, elementData);
        toast.success("Element created successfully");
      }
      // Mark the category as needing reload
      if (loadedCategoriesRef.current[categoryId]) {
        loadedCategoriesRef.current[categoryId] = false;
      }
      refresh();
      setElementDialogOpen(false);
      elementForm.reset({
        name: "",
        material_cost: "",
        labor_cost: "",
        markup_percentage: 20,
        position: 0,
        categoryId: categories.length > 0 ? categories[0].id : 0,
      });
      setEditingElementId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to save element: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      setIsSubmitting(true);
      switch (deleteType) {
        case "variable":
          await templateApi.deleteVariable(deleteId);
          toast.success("Variable deleted successfully");
          break;
        case "category":
          await categoryApi.delete(deleteId);
          toast.success("Category deleted successfully");
          break;
        case "element":
          await categoryApi.deleteElement(deleteId);
          toast.success("Element deleted successfully");
          break;
        case "template":
          await templateApi.delete(deleteId);
          toast.success("Template deleted successfully");
          router.push("/templates");
          return;
      }

      refresh();
      setDeleteDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to delete ${deleteType}: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dialog handlers
  const openVariableDialog = (variable?: Variable) => {
    if (variable) {
      setEditingVariableId(variable.id);
      variableForm.reset({
        name: variable.name,
        type: variable.type,
        variable_value: variable.default_value || 0, // Use default_value directly
      });
    } else {
      setEditingVariableId(null);
      variableForm.reset({
        name: "",
        type: "SQUARE_FEET",
        variable_value: 0,
      });
    }
    setVariableDialogOpen(true);
  };

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategoryId(category.id);
      categoryForm.reset({
        name: category.name,
        position: category.position,
      });
    } else {
      setEditingCategoryId(null);
      categoryForm.reset({
        name: "",
        position:
          categories.length > 0
            ? Math.max(...categories.map((c) => c.position)) + 1
            : 0,
      });
    }
    setCategoryDialogOpen(true);
  };

  const openElementDialog = (element?: Element, categoryId?: number) => {
    const selectedCategoryId = categoryId || categories[0]?.id || 0;

    if (element) {
      setEditingElementId(element.id);
      elementForm.reset({
        name: element.name,
        material_cost: element.material_cost,
        labor_cost: element.labor_cost,
        markup_percentage: Number(element.markup_percentage), // Convert to number here
        position: element.position,
        categoryId: selectedCategoryId,
      });
    } else {
      setEditingElementId(null);
      // Find the highest position in this category
      const elements = categoryElements[selectedCategoryId] || [];
      const maxPosition =
        elements.length > 0 ? Math.max(...elements.map((e) => e.position)) : -1;

      elementForm.reset({
        name: "",
        material_cost: "",
        labor_cost: "",
        markup_percentage: 20,
        position: maxPosition + 1,
        categoryId: selectedCategoryId,
      });
    }
    setElementDialogOpen(true);
  };

  const confirmDelete = (type: string, id: number, name: string) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteName(name);
    setDeleteDialogOpen(true);
  };

  // Update toggleCategoryExpanded to not cause re-renders of main data loader
  const toggleCategoryExpanded = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newState = {
        ...prev,
        [categoryId]: !prev[categoryId],
      };
      // Store in ref to avoid dependency loop - use the categoryId directly
      loadedCategoriesRef.current[categoryId] = newState[categoryId];
      return newState;
    });
  };

  // Stats calculations
  const totalVariables = variables.length;
  const totalCategories = categories.length;
  const totalElements = Object.values(categoryElements).reduce(
    (sum, elements) => sum + elements.length,
    0
  );

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/templates")}
            className="flex items-center gap-1 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
        </div>

        <Alert variant="destructive" className="border-red-300">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button onClick={refresh} variant="outline" className="mr-2">
                Retry
              </Button>
              <Button onClick={() => router.push("/templates")}>
                Back to Templates
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // During initial loading, return an empty placeholder
  if (!template && !isLoadingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Empty placeholder while global loader is displayed */}
      </div>
    );
  }

  // Only show template not found if loading is complete and template is still null
  if (isLoadingComplete && !template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/templates")}
            className="flex items-center gap-1 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
        </div>

        <div className="text-center py-20">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium">Template Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested template could not be found or may have been deleted.
          </p>
          <Button onClick={() => router.push("/templates")}>
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  function getUnitSymbol(type: string): import("react").ReactNode {
    switch (type) {
      case "LINEAR_FEET":
        return "ft";
      case "SQUARE_FEET":
        return "ft²";
      case "CUBIC_FEET":
        return "ft³";
      case "COUNT":
        return "units";
      default:
        return "";
    }
  }

  // Main content
  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/templates")}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingTemplate(true)}
                  className="gap-1"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Template
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Edit template name and description
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  onClick={() =>
                    confirmDelete(
                      "template",
                      templateId,
                      template?.name || "this template"
                    )
                  }
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete the entire template</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Replace the Template header info section (around line 946) with this */}
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {/* Template header with enhanced styling */}
        <motion.div
          className="bg-card rounded-lg border shadow-sm overflow-hidden"
          variants={slideUp}
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {template?.name}
                </h1>
                <p className="text-muted-foreground mt-1 mb-2">
                  {template?.description || "No description provided"}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Created{" "}
                  {template?.created_at ? formatDate(template.created_at) : ""}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
                <motion.div
                  variants={slideUp}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <StatCard
                    icon={
                      <VariableIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    }
                    label="Variables"
                    value={totalVariables}
                    color="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900"
                  />
                </motion.div>
                <motion.div
                  variants={slideUp}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <StatCard
                    icon={
                      <LayoutGrid className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    }
                    label="Categories"
                    value={totalCategories}
                    color="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900"
                  />
                </motion.div>
                <motion.div
                  variants={slideUp}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <StatCard
                    icon={
                      <List className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    }
                    label="Elements"
                    value={totalElements}
                    color="bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

{/* Tab navigation */}
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="mb-6">
    <TabsTrigger value="overview" className="flex items-center gap-2">
      <PieChart className="h-4 w-4" />
      <span>Overview</span>
    </TabsTrigger>
    <TabsTrigger value="variables" className="flex items-center gap-2">
      <VariableIcon className="h-4 w-4" />
      <span>Variables</span>
    </TabsTrigger>
    <TabsTrigger value="categories" className="flex items-center gap-2">
      <LayoutGrid className="h-4 w-4" />
      <span>Categories</span>
    </TabsTrigger>
    <TabsTrigger value="elements" className="flex items-center gap-2">
      <List className="h-4 w-4" />
      <span>Elements</span>
    </TabsTrigger>
  </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Variables overview */}
            <motion.div variants={slideUp} initial="hidden" animate="visible">
              <Card className="h-full shadow-sm">
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
                        Variables allow you to parameterize your template
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
                            key={variable.id}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center border p-3.5 rounded-lg bg-card hover:bg-muted/5 transition-colors"
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {/* Variable info column */}
                            <div className="flex flex-col">
                              <div className="font-medium">{variable.name}</div>
                              <VariableType type={variable.type} />
                            </div>

                            {/* Value column */}
                            <div className="sm:col-span-2">
                              <div className="py-2 px-3 rounded-md border bg-muted/30">
                                <span className="font-medium">
                                  {variable.default_value?.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                  <span className="ml-1 text-muted-foreground text-sm">
                                    {getUnitSymbol(variable.type)}
                                  </span>
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
                                onClick={() =>
                                  confirmDelete(
                                    "variable",
                                    variable.id,
                                    variable.name
                                  )
                                }
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
            </motion.div>

            {/* Categories overview */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full shadow-sm">
                <CardHeader className="pb-3 px-6">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2.5">
                      <div className="bg-purple-50 dark:bg-purple-900/30 p-1.5 rounded-md">
                        <Folder className="h-5 w-5 text-purple-500 dark:text-purple-400" />
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
                      <Folder className="h-8 w-8 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground font-medium">
                        No categories added yet
                      </p>
                      <p className="text-sm text-muted-foreground/70 mt-1 max-w-[240px] text-center">
                        Categories help organize your template elements
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
                        {categories.map((category) => (
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
                                {categoryElements[category.id]?.length || 0}{" "}
                                elements
                              </Badge>
                            </div>

                            {/* Actions column */}
                            <div className="flex gap-1.5 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
                                onClick={() => openCategoryDialog(category)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                                onClick={() =>
                                  confirmDelete(
                                    "category",
                                    category.id,
                                    category.name
                                  )
                                }
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
            </motion.div>
          </div>

          {/* Elements overview */}
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-sm">
              <CardHeader className="pb-3 px-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2.5">
                    <div className="bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-md">
                      <List className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    </div>
                    <span>Elements</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs font-normal"
                    >
                      {totalElements}
                    </Badge>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openElementDialog()}
                    className="h-8 gap-1 px-3"
                    disabled={categories.length === 0}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/10">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground font-medium">
                      No categories available
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1 max-w-[280px] text-center">
                      Create categories first before adding elements
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
                ) : totalElements === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/10">
                    <List className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground font-medium">
                      No elements added yet
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1 max-w-[280px] text-center">
                      Elements are the building blocks of your template
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openElementDialog()}
                      className="mt-5"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Element
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 mt-1">
                    <AnimatePresence>
                      {categories.map((category) => (
                        <Collapsible
                          key={category.id}
                          className="border rounded-lg overflow-hidden"
                          open={expandedCategories[category.id]}
                          onOpenChange={() =>
                            toggleCategoryExpanded(category.id)
                          }
                        >
                          <div className="flex items-center justify-between w-full py-3 px-4 bg-card/80 hover:bg-muted/5 transition-colors">
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-2.5 font-medium text-left cursor-pointer">
                                <ChevronRight
                                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                    expandedCategories[category.id]
                                      ? "rotate-90"
                                      : ""
                                  }`}
                                />
                                <span>{category.name}</span>
                                <Badge
                                  variant="outline"
                                  className="bg-secondary/30 dark:bg-secondary/20 text-xs font-normal"
                                >
                                  {categoryElements[category.id]?.length || 0}
                                </Badge>
                              </div>
                            </CollapsibleTrigger>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openElementDialog(undefined, category.id);
                              }}
                              className="h-7 gap-1 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Element
                            </Button>
                          </div>

                          <CollapsibleContent className="px-4 pb-3 pt-1.5 border-t bg-muted/5">
                            {!categoryElements[category.id] ||
                            categoryElements[category.id].length === 0 ? (
                              <div className="text-center py-4 text-sm text-muted-foreground italic">
                                No elements in this category
                              </div>
                            ) : (
                              <div className="space-y-2.5 mt-1.5 pl-6">
                                {categoryElements[category.id]?.map(
                                  (element) => (
                                    <motion.div
                                      key={element.id}
                                      className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/10 transition-colors"
                                      variants={slideUp}
                                      initial="hidden"
                                      animate="visible"
                                    >
                                      <div>
                                        <div className="font-medium text-sm">
                                          {element.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                                          <span className="flex items-center gap-1">
                                            Material:
                                            <code className="text-xs bg-muted/30 dark:bg-muted/20 px-1.5 py-0.5 rounded">
                                              {element.material_cost}
                                            </code>
                                          </span>
                                          <span className="text-muted-foreground/40">
                                            •
                                          </span>
                                          <span className="flex items-center gap-1">
                                            Labor:
                                            <code className="text-xs bg-muted/30 dark:bg-muted/20 px-1.5 py-0.5 rounded">
                                              {element.labor_cost}
                                            </code>
                                          </span>
                                          <span className="text-muted-foreground/40">
                                            •
                                          </span>
                                          <span>
                                            Markup: {element.markup_percentage}%
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex gap-1.5">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 rounded-full text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20"
                                          onClick={() =>
                                            openElementDialog(
                                              element,
                                              category.id
                                            )
                                          }
                                        >
                                          <Edit2 className="h-3.5 w-3.5" />
                                          <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                                          onClick={() =>
                                            confirmDelete(
                                              "element",
                                              element.id,
                                              element.name
                                            )
                                          }
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          <span className="sr-only">
                                            Delete
                                          </span>
                                        </Button>
                                      </div>
                                    </motion.div>
                                  )
                                )}
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

  {/* Variables Tab */}
  <TabsContent value="variables">
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
                    Variables allow you to parameterize your template
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
                <div className="space-y-2">
                  <AnimatePresence>
                    {variables.map((variable) => (
                      <motion.div
                        key={variable.id}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center border p-3.5 rounded-lg bg-card hover:bg-muted/5 transition-colors"
                        variants={slideUp}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {/* Variable info column */}
                        <div className="flex flex-col">
                          <div className="font-medium">{variable.name}</div>
                          <VariableType type={variable.type} />
                        </div>

                        {/* Value column */}
                        <div className="sm:col-span-2">
                          <div className="py-2 px-3 rounded-md border bg-muted/30">
                            <span className="font-medium">
                              {variable.default_value?.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                }
                              )}
                              <span className="ml-1 text-muted-foreground text-sm">
                                {getUnitSymbol(variable.type)}
                              </span>
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
                            onClick={() =>
                              confirmDelete(
                                "variable",
                                variable.id,
                                variable.name
                              )
                            }
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
        </TabsContent>

  {/* Categories Tab */}
  <TabsContent value="categories">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-1.5 rounded-md">
                  <Folder className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
                <span>Categories</span>
                <Badge variant="secondary" className="ml-1 text-xs font-normal">
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
                <Folder className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">
                  No categories added yet
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-[240px] text-center">
                  Categories help organize your template elements
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
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    variants={slideUp}
                    initial="hidden"
                    animate="visible"
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <h3 className="font-medium">{category.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>Position: {category.position}</span>
                            <span className="text-muted-foreground/30">•</span>
                            <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              {categoryElements[category.id]?.length || 0}{" "}
                              elements
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openElementDialog(undefined, category.id)
                            }
                            className="h-8"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Element
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
                            onClick={() => openCategoryDialog(category)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                            onClick={() =>
                              confirmDelete(
                                "category",
                                category.id,
                                category.name
                              )
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Elements List */}
                      {categoryElements[category.id]?.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-purple-100 dark:border-purple-900">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categoryElements[category.id].map((element) => (
                              <motion.div
                                key={element.id}
                                variants={slideUp}
                                className="flex items-center justify-between p-2 border rounded-md bg-muted/5"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">
                                    {element.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    Material: {element.material_cost} • Labor:{" "}
                                    {element.labor_cost}
                                  </p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full"
                                    onClick={() =>
                                      openElementDialog(element, category.id)
                                    }
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full"
                                    onClick={() =>
                                      confirmDelete(
                                        "element",
                                        element.id,
                                        element.name
                                      )
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

  {/* Elements Tab */}
  <TabsContent value="elements">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-md">
                  <List className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <span>Elements</span>
                <Badge variant="secondary" className="ml-1 text-xs font-normal">
                  {totalElements}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openElementDialog()}
                className="h-8 gap-1 px-3"
                disabled={categories.length === 0}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/10">
                <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">
                  No categories available
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-[280px] text-center">
                  Create categories first before adding elements
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
            ) : totalElements === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/10">
                <List className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">
                  No elements added yet
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-[280px] text-center">
                  Elements are the building blocks of your template
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openElementDialog()}
                  className="mt-5"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Element
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {categories.map((category) => (
                    <Collapsible
                      key={category.id}
                      className="border rounded-lg overflow-hidden"
                      open={expandedCategories[category.id]}
                      onOpenChange={() => toggleCategoryExpanded(category.id)}
                    >
                      <div className="flex items-center justify-between w-full py-3 px-4 bg-card/80 hover:bg-muted/5 transition-colors">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-2.5 font-medium text-left cursor-pointer">
                            <ChevronRight
                              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                expandedCategories[category.id]
                                  ? "rotate-90"
                                  : ""
                              }`}
                            />
                            <span>{category.name}</span>
                            <Badge
                              variant="outline"
                              className="bg-secondary/30 dark:bg-secondary/20 text-xs font-normal"
                            >
                              {categoryElements[category.id]?.length || 0}
                            </Badge>
                          </div>
                        </CollapsibleTrigger>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openElementDialog(undefined, category.id);
                          }}
                          className="h-7 gap-1 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Element
                        </Button>
                      </div>

                      <CollapsibleContent className="px-4 pb-3 pt-1.5 border-t bg-muted/5">
                        {!categoryElements[category.id] ||
                        categoryElements[category.id].length === 0 ? (
                          <div className="text-center py-4 text-sm text-muted-foreground italic">
                            No elements in this category
                          </div>
                        ) : (
                          <div className="space-y-2.5 mt-1.5 pl-6">
                            {categoryElements[category.id].map((element) => (
                              <motion.div
                                key={element.id}
                                className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/10 transition-colors"
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                              >
                                <div>
                                  <div className="font-medium text-sm">
                                    {element.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                                    <span className="flex items-center gap-1">
                                      Material:
                                      <code className="text-xs bg-muted/30 dark:bg-muted/20 px-1.5 py-0.5 rounded">
                                        {element.material_cost}
                                      </code>
                                    </span>
                                    <span className="text-muted-foreground/40">
                                      •
                                    </span>
                                    <span className="flex items-center gap-1">
                                      Labor:
                                      <code className="text-xs bg-muted/30 dark:bg-muted/20 px-1.5 py-0.5 rounded">
                                        {element.labor_cost}
                                      </code>
                                    </span>
                                    <span className="text-muted-foreground/40">
                                      •
                                    </span>
                                    <span>
                                      Markup: {element.markup_percentage}%
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20"
                                    onClick={() =>
                                      openElementDialog(element, category.id)
                                    }
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                                    onClick={() =>
                                      confirmDelete(
                                        "element",
                                        element.id,
                                        element.name
                                      )
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the basic details of your template.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={templateForm.handleSubmit(updateTemplate)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Template Name
                </Label>
                <Input
                  id="name"
                  {...templateForm.register("name", { required: true })}
                  placeholder="Enter template name"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...templateForm.register("description")}
                  placeholder="Brief description of this template"
                  className="col-span-3 min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingTemplate(false)}
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
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                : "Variables can be used to parameterize your template."}
            </DialogDescription>
          </DialogHeader>
          <Form {...variableForm}>
            <form
              onSubmit={variableForm.handleSubmit(handleVariableSubmit)}
              className="space-y-4"
            >
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
                name="variable_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || 0} // Ensure value is never undefined
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
                      Default value for this variable when creating proposals.
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
                        : "Create Variable"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                : "Categories help organize elements in your template."}
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
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Order in which this category appears (lower numbers
                      first).
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
                        : "Create Category"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Element Dialog */}
      <Dialog open={elementDialogOpen} onOpenChange={setElementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingElementId ? "Edit Element" : "Add Element"}
            </DialogTitle>
            <DialogDescription>
              {editingElementId
                ? "Update the details for this element."
                : "Elements are the building blocks of your template."}
            </DialogDescription>
          </DialogHeader>
          <Form {...elementForm}>
            <form
              onSubmit={elementForm.handleSubmit(handleElementSubmit)}
              className="space-y-4"
            >
              <FormField
                control={elementForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
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
              <FormField
                control={elementForm.control}
                name="name"
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={elementForm.control}
                  name="material_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Cost</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5" {...field} />
                      </FormControl>
                      <FormDescription>
                        Can use variables like &apos;Room_Size&apos;.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={elementForm.control}
                  name="labor_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Labor Cost</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3" {...field} />
                      </FormControl>
                      <FormDescription>
                        Can use variables like &apos;Room_Size&apos;.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={elementForm.control}
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Profit margin percentage.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={elementForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Display order.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setElementDialogOpen(false)}
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
                      {editingElementId ? "Update Element" : "Create Element"}
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
              This will permanently delete the {deleteType} &quot;{deleteName}
              &quot;.
              {deleteType === "category" && (
                <span className="text-red-500 font-medium block mt-2">
                  Warning: This will also delete all elements within this
                  category!
                </span>
              )}
              {deleteType === "template" && (
                <span className="text-red-500 font-medium block mt-2">
                  Warning: This will permanently delete the entire template and
                  all its contents!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteConfirm}
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
    </div>
  );
}

// Stats Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`p-4 rounded-md border ${color} flex items-center gap-3 min-w-[120px]`}
    >
      <div className="bg-card dark:bg-card/40 rounded-md p-2 shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}
