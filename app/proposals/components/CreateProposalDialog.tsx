"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Check,
  Dices,
  Component,
  X,
  Search,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { proposalApi, templateApi, Template, categoryApi } from "../../api/apiService";
import { cn } from "@/lib/utils";

// Form schema definition
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Proposal name must be at least 2 characters.",
  }),
  creationType: z.enum(["fromTemplate", "fromScratch"]),
  templateId: z.number().optional().nullable(),
  global_markup_percentage: z.number().min(0).max(100),
  variables: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, { message: "Variable name must be at least 2 characters." }),
        type: z.enum(["LINEAR_FEET", "SQUARE_FEET", "CUBIC_FEET", "COUNT"]),
        default_value: z.number().optional(), // Added default_value field
      })
    )
    .optional(),
  categories: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, { message: "Category name must be at least 2 characters." }),
        position: z.number(),
        elements: z.array(
          z.object({
            name: z.string().min(2, {
              message: "Element name must be at least 2 characters.",
            }),
            material_cost: z.string(),
            labor_cost: z.string(),
            markup_percentage: z.number().min(0).max(100),
            position: z.number(),
          })
        ),
      })
    )
    .optional(),
});

interface CreateProposalDialogProps {
  onProposalCreated: () => void;
}

// Animation variants with consistent timing
const dialogAnimation = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export function CreateProposalDialog({
  onProposalCreated,
}: CreateProposalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isDialogMounted, setIsDialogMounted] = useState(false);
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    variables?: string;
    categories?: string;
  }>({});
  const templatesLoadedRef = useRef(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      creationType: "fromTemplate",
      templateId: null,
      global_markup_percentage: 20,
      variables: [],
      categories: [],
    },
  });

  const creationType = form.watch("creationType");
  const selectedTemplateId = form.watch("templateId");
  const variables = form.watch("variables") || [];
  const categories = form.watch("categories") || [];

  // Clear validation errors when tab changes or creation type changes
  useEffect(() => {
    setValidationErrors({});
  }, [activeTab, creationType]);

  // Pre-load templates - this will be awaited before dialog shows content
  const loadTemplates = useCallback(async () => {
    if (!templatesLoadedRef.current && !isLoadingTemplates) {
      try {
        setIsLoadingTemplates(true);
        const response = await templateApi.list();
        setTemplates(response.items || []);
        templatesLoadedRef.current = true;

        // Auto-select first template if in template mode
        if (
          response.items &&
          response.items.length > 0 &&
          form.getValues("creationType") === "fromTemplate" &&
          !form.getValues("templateId")
        ) {
          form.setValue("templateId", response.items[0].id);
        }

        return response.items || [];
      } catch (error) {
        console.error("Failed to load templates:", error);
        toast.error("Failed to load templates");
        return [];
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    return templates;
  }, [templates, isLoadingTemplates, form]);

  // Handle dialog opening with fixed dimensions from the start
  const handleDialogOpenChange = async (open: boolean) => {
    if (open) {
      // First reset the form to initialize values
      form.reset({
        name: "",
        creationType: "fromTemplate",
        templateId: null,
        global_markup_percentage: 20,
        variables: [],
        categories: [],
      });

      // Clear template search term and validation errors
      setTemplateSearchTerm("");
      setValidationErrors({});

      // Then open the dialog immediately with the fixed size
      setIsOpen(true);
      setIsDialogMounted(true);
      setActiveTab("basic");
      setCreationProgress(0);

      // Load templates asynchronously - dialog already has correct size
      const loadedTemplates = await loadTemplates();
      
      // Auto-select first template if available
      if (loadedTemplates.length > 0) {
        form.setValue("templateId", loadedTemplates[0].id);
      }
    } else {
      setIsOpen(false);

      // Delay unmounting until after exit animation
      setTimeout(() => {
        setIsDialogMounted(false);
        // Reset form values when dialog is closed
        form.reset();
        // Reset template search and errors
        setTemplateSearchTerm("");
        setValidationErrors({});
      }, 200);
    }
  };

  // Reset form when creation type changes - with debounce to prevent flicker
  useEffect(() => {
    if (!isDialogMounted) return;

    const timer = setTimeout(() => {
      if (creationType === "fromTemplate") {
        // Clear variables and categories when switching to template mode
        form.setValue("variables", []);
        form.setValue("categories", []);
        setValidationErrors({});

        // Select first template when switching to template mode if none is selected
        if (templates.length > 0 && !form.getValues("templateId")) {
          form.setValue("templateId", templates[0].id);
        }
      } else if (creationType === "fromScratch") {
        // Clear template selection when switching to from scratch
        form.setValue("templateId", null);
        setValidationErrors({});
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [creationType, templates, form, isDialogMounted]);

  // Validate form data based on current tab and creation type
  const validateCurrentTab = (): boolean => {
    // Reset errors
    setValidationErrors({});
    
    // For template creation, just validate basic info
    if (creationType === "fromTemplate") {
      return true;
    }
    
    // For from scratch, validate based on current tab
    if (activeTab === "basic") {
      return true; // Basic tab validation is handled by form.trigger in goToNextTab
    } 
    else if (activeTab === "variables") {
      if (variables.length === 0) {
        setValidationErrors({
          variables: "Please add at least one variable before proceeding"
        });
        return false;
      }
      
      // Check if all variables have names
      const emptyNameVariables = variables.some(v => !v.name.trim());
      if (emptyNameVariables) {
        setValidationErrors({
          variables: "All variables must have names"
        });
        return false;
      }
      
      return true;
    } 
    else if (activeTab === "categories") {
      // For final submission, validate everything
      
      // First check if variables exist
      if (variables.length === 0) {
        setValidationErrors({
          variables: "Please add at least one variable"
        });
        setActiveTab("variables");
        return false;
      }
      
      // Then check if categories exist
      if (categories.length === 0) {
        setValidationErrors({
          categories: "Please add at least one category"
        });
        return false;
      }
      
      // Check if categories have elements
      const emptyCategoryIndex = categories.findIndex(c => !c.elements || c.elements.length === 0);
      if (emptyCategoryIndex !== -1) {
        setValidationErrors({
          categories: `Category "${categories[emptyCategoryIndex].name || `#${emptyCategoryIndex + 1}`}" has no elements`
        });
        return false;
      }
      
      // Check for empty category names
      const emptyNameCategories = categories.some(c => !c.name.trim());
      if (emptyNameCategories) {
        setValidationErrors({
          categories: "All categories must have names"
        });
        return false;
      }
      
      // Check for empty element names
      const emptyNameElements = categories.some(c => 
        c.elements.some(e => !e.name.trim())
      );
      if (emptyNameElements) {
        setValidationErrors({
          categories: "All elements must have names"
        });
        return false;
      }
      
      return true;
    }
    
    return true;
  };

  const goToNextTab = async () => {
    if (activeTab === "basic") {
      // Validate basic info before proceeding
      const basicInfoValid = await form.trigger([
        "name",
        "global_markup_percentage",
      ]);
      
      if (basicInfoValid) {
        if (creationType === "fromScratch") {
          setActiveTab("variables");
        } else {
          // If from template, validate template selection and create
          if (!selectedTemplateId && templates.length > 0) {
            toast.error("Please select a template");
            return;
          }
          onSubmit(form.getValues());
        }
      }
    } else if (activeTab === "variables") {
      // Validate variables before proceeding to categories
      if (validateCurrentTab()) {
        setActiveTab("categories");
      }
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "variables") {
      setActiveTab("basic");
    } else if (activeTab === "categories") {
      setActiveTab("variables");
    }
  };

  // Filtered templates based on search term
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(templateSearchTerm.toLowerCase())
  );

  // Create from template or scratch
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // For from scratch, validate all inputs first
    if (values.creationType === "fromScratch" && !validateCurrentTab()) {
      return; // Stop submission if validation fails
    }
  
    setIsCreating(true);
    setCreationProgress(10);
  
    try {
      if (values.creationType === "fromTemplate") {
        // Complete the template creation code
        if (!values.templateId) {
          throw new Error("No template selected");
        }
        
        setCreationProgress(30);
        
        // Create the proposal from the selected template
        await proposalApi.createFromTemplate({
          name: values.name,
          template_id: values.templateId,
          global_markup_percentage: values.global_markup_percentage
        });
        
        setCreationProgress(100);
        
        form.reset();
        onProposalCreated();
        toast.success("Proposal created successfully from template");
        
        setTimeout(() => {
          setIsOpen(false);
          setCreationProgress(0);
        }, 500);
        
        return;
      } else {
        setCreationProgress(30);
        // Create the proposal from scratch first
        const proposal = await proposalApi.createFromScratch({
          name: values.name,
          global_markup_percentage: values.global_markup_percentage,
        });
  
        setCreationProgress(50);
  
        // If we have variables, create them
        if (values.variables?.length) {
          setCreationProgress(60);
          const variableValues = values.variables.map((variable, index) => ({
            variable_id: -(index + 1),
            variable_name: variable.name,
            variable_type: variable.type,
            value: variable.default_value || 0,
          }));
  
          if (variableValues.length > 0) {
            await proposalApi.setVariableValues(proposal.id, variableValues);
          }
        }
  
        // If we have categories and elements, create them
        if (values.categories?.length) {
          setCreationProgress(80);
  
          // First create categories to ensure they exist
          for (const category of values.categories) {
            await categoryApi.createForProposal(proposal.id, {
              name: category.name,
              position: category.position
            });
          }
  
          // Then create elements with their categories
          const elementValues = values.categories.flatMap((category) => 
            (category.elements || []).map((element, elementIndex) => ({
              element_id: -(elementIndex + 1), // Use unique negative IDs
              element_name: element.name,
              category_name: category.name,
              calculated_material_cost: parseFloat(element.material_cost || "0"),
              calculated_labor_cost: parseFloat(element.labor_cost || "0"),
              markup_percentage: element.markup_percentage,
              position: element.position,
              category_position: category.position
            }))
          );
  
          if (elementValues.length > 0) {
            await proposalApi.updateElementValues(proposal.id, elementValues);
          }
        }
      }
  
      setCreationProgress(100);
      form.reset();
      onProposalCreated();
      toast.success("Proposal created successfully");
  
      setTimeout(() => {
        setIsOpen(false);
        setCreationProgress(0);
      }, 500);
    } catch (error) {
      console.error("Proposal creation failed:", error);
      toast.error(
        "Failed to create proposal: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      setCreationProgress(0);
    } finally {
      setIsCreating(false);
    }
  };

  // Generate a random proposal name
  const generateRandomName = () => {
    const prefixes = [
      "Residential",
      "Commercial",
      "Renovation",
      "Interior",
      "Exterior",
      "Custom",
    ];
    const types = ["Project", "Proposal", "Estimate", "Contract", "Plan"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    form.setValue("name", `${randomPrefix} ${randomType} #${randomNumber}`);
  };

  // Clear template selection
  const clearTemplateSelection = () => {
    form.setValue("templateId", null);
  };

  // Check if button should be disabled
  const isSubmitButtonDisabled = () => {
    if (isCreating) return true;

    if (creationType === "fromTemplate") {
      // Only disable if we have templates but none is selected
      return templates.length > 0 && !selectedTemplateId;
    }

    // For fromScratch, if on the last tab we'll check in the validateCurrentTab function
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Proposal
          </Button>
        </motion.div>
      </DialogTrigger>

      <AnimatePresence mode="wait">
        {(isOpen || isDialogMounted) && (
          <DialogContent
            className="sm:max-w-[840px] p-0 gap-0 font-sans overflow-auto"
            style={{
              minHeight: "640px", // Increased size by ~15% (from 560px)
              transform: "translateZ(0)", // Hardware acceleration
              backfaceVisibility: "hidden", // Prevent flickering
              willChange: "transform", // Hint to the browser
            }}
            forceMount
          >
            <motion.div
              className="w-full h-full"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dialogAnimation}
            >
              {isCreating && (
                <div className="absolute inset-x-0 top-0 z-10">
                  <Progress
                    value={creationProgress}
                    className="h-1 rounded-none"
                  />
                </div>
              )}

              <DialogHeader className="p-6 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <DialogTitle className="text-xl">
                    Create New Proposal
                  </DialogTitle>
                </div>
                <DialogDescription>
                  Create a proposal either from a template or from scratch.
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                {creationType === "fromScratch" && (
                  <div className="px-6">
                    <TabsList className="grid grid-cols-3 mb-2">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="variables">Variables</TabsTrigger>
                      <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList>
                  </div>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {/* Basic tab content with 650px height */}
                    <TabsContent value="basic" className="mt-0">
                      <ScrollArea
                        className="px-6 py-4"
                        style={{ height: "650px" }}
                      >
                        <div className="space-y-6">
                          {/* Name field */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between items-center">
                                  <FormLabel>Proposal Name</FormLabel>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateRandomName}
                                    className="h-8 text-xs flex gap-1 text-muted-foreground"
                                  >
                                    <Dices className="h-3.5 w-3.5" />
                                    Generate
                                  </Button>
                                </div>
                                <FormControl>
                                  <Input
                                    placeholder="Enter proposal name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  A name that describes this proposal&apos;s
                                  purpose.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Markup percentage field */}
                          <FormField
                            control={form.control}
                            name="global_markup_percentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Global Markup Percentage (%)
                                </FormLabel>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <FormControl>
                                      <Slider
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={[field.value]}
                                        onValueChange={(value: number[]) =>
                                          field.onChange(value[0])
                                        }
                                        className="w-full"
                                      />
                                    </FormControl>
                                    <span className="font-medium ml-4 w-12 text-right">
                                      {field.value}%
                                    </span>
                                  </div>
                                </div>
                                <FormDescription>
                                  Default markup to apply across all items in
                                  this proposal.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Creation type field */}
                          <FormField
                            control={form.control}
                            name="creationType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Proposal Creation Method</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      setActiveTab("basic");
                                    }}
                                    defaultValue={field.value}
                                    value={field.value}
                                    className="grid grid-cols-2 gap-4"
                                  >
                                    {/* Template option */}
                                    <FormItem>
                                      <FormControl>
                                        <RadioGroupItem
                                          value="fromTemplate"
                                          id="fromTemplate"
                                          className="peer sr-only"
                                        />
                                      </FormControl>
                                      <label
                                        htmlFor="fromTemplate"
                                        className="flex flex-col items-center justify-between border rounded-lg p-4 cursor-pointer
                            peer-checked:bg-green-50 peer-checked:border-green-200
                            hover:border-green-100 hover:bg-green-50/50 transition-colors"
                                      >
                                        <Component className="h-8 w-8 mb-2 text-green-600" />
                                        <p className="font-medium text-sm">
                                          From Template
                                        </p>
                                        <p className="text-xs text-muted-foreground text-center mt-1">
                                          Use an existing template as a starting
                                          point
                                        </p>
                                      </label>
                                    </FormItem>

                                    {/* From scratch option */}
                                    <FormItem>
                                      <FormControl>
                                        <RadioGroupItem
                                          value="fromScratch"
                                          id="fromScratch"
                                          className="peer sr-only"
                                        />
                                      </FormControl>
                                      <label
                                        htmlFor="fromScratch"
                                        className="flex flex-col items-center justify-between border rounded-lg p-4 cursor-pointer
                            peer-checked:bg-green-50 peer-checked:border-green-200
                            hover:border-green-100 hover:bg-green-50/50 transition-colors"
                                      >
                                        <FileText className="h-8 w-8 mb-2 text-green-600" />
                                        <p className="font-medium text-sm">
                                          From Scratch
                                        </p>
                                        <p className="text-xs text-muted-foreground text-center mt-1">
                                          Create a blank proposal to customize
                                        </p>
                                      </label>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Template selection field - now a searchable combobox with clear button */}
                          {creationType === "fromTemplate" && (
                            <FormField
                              control={form.control}
                              name="templateId"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Select Template</FormLabel>
                                  <div className="h-[100px]">
                                    {isLoadingTemplates ? (
                                      <div className="flex flex-col items-center justify-center h-full py-2 border rounded-md">
                                        <svg
                                          className="animate-spin h-5 w-5 text-green-600 mb-2"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                        <p className="text-sm text-muted-foreground">
                                          Loading templates...
                                        </p>
                                      </div>
                                    ) : templates.length === 0 ? (
                                      <div className="text-center p-4 h-full border rounded-md bg-muted/10 flex flex-col justify-center">
                                        <p className="text-muted-foreground">
                                          No templates available.
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Create templates first before creating
                                          proposals from them.
                                        </p>
                                      </div>
                                    ) : (
                                      <FormControl>
                                        <div className="flex gap-2">
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between overflow-hidden"
                                              >
                                                {field.value
                                                  ? templates.find(
                                                      (template) =>
                                                        template.id ===
                                                        field.value
                                                    )?.name || "Select a template"
                                                  : "Select a template"}
                                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                              <Command>
                                                <CommandInput
                                                  placeholder="Search templates..."
                                                  onValueChange={
                                                    setTemplateSearchTerm
                                                  }
                                                  value={templateSearchTerm}
                                                />
                                                <CommandList>
                                                  <CommandEmpty>
                                                    No templates found.
                                                  </CommandEmpty>
                                                  <CommandGroup>
                                                    {filteredTemplates.map(
                                                      (template) => (
                                                        <CommandItem
                                                          key={template.id}
                                                          value={template.name}
                                                          onSelect={() => {
                                                            form.setValue(
                                                              "templateId",
                                                              template.id
                                                            );
                                                          }}
                                                          className={cn(
                                                            "cursor-pointer",
                                                            field.value ===
                                                              template.id &&
                                                              "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                                                          )}
                                                        >
                                                          <Check
                                                            className={cn(
                                                              "mr-2 h-4 w-4",
                                                              field.value ===
                                                                template.id
                                                                ? "opacity-100 text-green-600"
                                                                : "opacity-0"
                                                            )}
                                                          />
                                                          {template.name}
                                                        </CommandItem>
                                                      )
                                                    )}
                                                  </CommandGroup>
                                                </CommandList>
                                              </Command>
                                            </PopoverContent>
                                          </Popover>
                                          {field.value && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="flex-shrink-0"
                                              onClick={clearTemplateSelection}
                                              title="Clear selection"
                                            >
                                              <RotateCcw className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </FormControl>
                                    )}
                                  </div>
                                  <FormDescription>
                                    The template will provide variables,
                                    categories, and elements for your proposal.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Variables tab with 400px height */}
                    <TabsContent value="variables" className="mt-0">
                      <ScrollArea
                        className="px-6 py-4"
                        style={{ height: "400px" }}
                      >
                        {validationErrors.variables && (
                          <Alert variant="destructive" className="mb-4 bg-red-50 text-red-800 border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {validationErrors.variables}
                            </AlertDescription>
                          </Alert>
                        )}
                        <VariablesTab form={form} />
                      </ScrollArea>
                    </TabsContent>

                    {/* Categories tab with 400px height */}
                    <TabsContent value="categories" className="mt-0">
                      <ScrollArea
                        className="px-6 py-4"
                        style={{ height: "400px" }}
                      >
                        {validationErrors.categories && (
                          <Alert variant="destructive" className="mb-4 bg-red-50 text-red-800 border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {validationErrors.categories}
                            </AlertDescription>
                          </Alert>
                        )}
                        <CategoriesTab form={form} />
                      </ScrollArea>
                    </TabsContent>

                    {/* Fixed footer */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-background border-t"
                      style={{
                        height: "72px",
                        zIndex: 10,
                      }}
                    >
                      <DialogFooter className="p-6 flex flex-row items-center justify-between sm:justify-between h-full">
                        <div>
                          {activeTab !== "basic" &&
                            creationType === "fromScratch" && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={goToPreviousTab}
                              >
                                Previous
                              </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                          {creationType === "fromTemplate" ||
                          activeTab === "categories" ? (
                            <Button
                              type="button"
                              onClick={form.handleSubmit(onSubmit)}
                              className={cn(
                                "bg-green-600 hover:bg-green-700",
                                isSubmitButtonDisabled() && "opacity-50 cursor-not-allowed"
                              )}
                              disabled={isSubmitButtonDisabled()}
                              >
                                {isCreating ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Create Proposal
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={async () => {
                                  // Validate current tab before proceeding
                                  let isValid = false;
                                  
                                  if (activeTab === "basic") {
                                    isValid = await form.trigger(["name", "global_markup_percentage"]);
                                  } else if (activeTab === "variables") {
                                    // Validate all variable fields if any exist
                                    const variables = form.getValues("variables") || [];
                                    if (variables.length > 0) {
                                      isValid = await form.trigger("variables");
                                    } else {
                                      isValid = true; // No variables is valid at this point but will be checked later
                                    }
                                  }
                                  
                                  if (isValid) {
                                    // Check for additional validation rules specific to our app
                                    if (validateCurrentTab()) {
                                      goToNextTab();
                                    }
                                  } else {
                                    // Show toast to inform user about validation issues
                                    toast.error("Please complete all required fields before proceeding");
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Next
                              </Button>
                            )}
                          </div>
                        </DialogFooter>
                      </div>
                    </form>
                  </Form>
                </Tabs>
              </motion.div>
            </DialogContent>
          )}
        </AnimatePresence>
      </Dialog>
    );
  }
  
  // Variables Tab Component
  function VariablesTab({
    form,
  }: {
    form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
  }) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Variables</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentVariables = form.getValues("variables") || [];
              form.setValue("variables", [
                ...currentVariables,
                { name: "", type: "SQUARE_FEET", default_value: 0 },
              ]);
            }}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Variable
          </Button>
        </div>
  
        <div className="space-y-4">
          {!form.watch("variables") || form.watch("variables")?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                No variables added yet. Variables allow you to customize
                calculations.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {form.watch("variables")?.map((_, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  className="flex gap-4 items-start border p-4 rounded-md bg-card"
                >
                  <FormField
                    control={form.control}
                    name={`variables.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Variable Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Room Size" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variables.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Unit Type</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                              >
                                {field.value === "SQUARE_FEET" && "Square Feet"}
                                {field.value === "LINEAR_FEET" && "Linear Feet"}
                                {field.value === "COUNT" && "Count"}
                                {field.value === "CUBIC_FEET" && "Cubic Feet"}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandList>
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={() => field.onChange("SQUARE_FEET")}
                                      className={cn(
                                        "cursor-pointer",
                                        field.value === "SQUARE_FEET" &&
                                          "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                                      )}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === "SQUARE_FEET"
                                            ? "opacity-100 text-green-600"
                                            : "opacity-0"
                                        )}
                                      />
                                      Square Feet
                                    </CommandItem>
                                    <CommandItem
                                      onSelect={() => field.onChange("LINEAR_FEET")}
                                      className={cn(
                                        "cursor-pointer",
                                        field.value === "LINEAR_FEET" &&
                                          "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                                      )}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === "LINEAR_FEET"
                                            ? "opacity-100 text-green-600"
                                            : "opacity-0"
                                        )}
                                      />
                                      Linear Feet
                                    </CommandItem>
                                    <CommandItem
                                      onSelect={() => field.onChange("CUBIC_FEET")}
                                      className={cn(
                                        "cursor-pointer",
                                        field.value === "CUBIC_FEET" &&
                                          "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                                      )}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === "CUBIC_FEET"
                                            ? "opacity-100 text-green-600"
                                            : "opacity-0"
                                        )}
                                      />
                                      Cubic Feet
                                    </CommandItem>
                                    <CommandItem
                                      onSelect={() => field.onChange("COUNT")}
                                      className={cn(
                                        "cursor-pointer",
                                        field.value === "COUNT" &&
                                          "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                                      )}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === "COUNT"
                                            ? "opacity-100 text-green-600"
                                            : "opacity-0"
                                        )}
                                      />
                                      Count
                                    </CommandItem>
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  {/* Default Value Field */}
                  <FormField
                    control={form.control}
                    name={`variables.${index}.default_value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Default Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-5.5 hover:bg-red-50 hover:text-red-500"
                    onClick={() => {
                      const variables = form.getValues("variables") || [];
                      form.setValue(
                        "variables",
                        variables.filter((_, i: number) => i !== index)
                      );
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  }

  // Categories Tab Component
  function CategoriesTab({
    form,
  }: {
    form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
  }) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Categories & Elements</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentCategories = form.getValues("categories") || [];
              form.setValue("categories", [
                ...currentCategories,
                {
                  name: "",
                  position: currentCategories.length + 1,
                  elements: [],
                },
              ]);
            }}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Category
          </Button>
        </div>

        <div className="space-y-6">
          {!form.watch("categories") || form.watch("categories")?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                No categories added yet. Categories organize related elements in
                your proposal.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {form.watch("categories")?.map((_, categoryIndex: number) => (
                <CategoryFormItem
                  key={categoryIndex}
                  form={form}
                  categoryIndex={categoryIndex}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  }

  // Category Form Item Component
  function CategoryFormItem({
    form,
    categoryIndex,
  }: {
    form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
    categoryIndex: number;
  }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="border rounded-lg p-4 space-y-4 bg-card/50"
      >
        <div className="flex gap-4 items-start">
          <FormField
            control={form.control}
            name={`categories.${categoryIndex}.name`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Flooring" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-5.5 hover:bg-red-50 hover:text-red-500"
            onClick={() => {
              const categories = form.getValues("categories") || [];
              form.setValue(
                "categories",
                categories.filter((_, i: number) => i !== categoryIndex)
              );
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Elements Section */}
        <div className="pl-4 border-l-2 border-green-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Elements</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentElements =
                  form.getValues(`categories.${categoryIndex}.elements`) || [];
                form.setValue(`categories.${categoryIndex}.elements`, [
                  ...currentElements,
                  {
                    name: "",
                    material_cost: "",
                    labor_cost: "",
                    markup_percentage: form.getValues("global_markup_percentage"),
                    position: currentElements.length + 1,
                  },
                ]);
              }}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Element
            </Button>
          </div>

          <div className="space-y-4">
            {!form.watch(`categories.${categoryIndex}.elements`) ||
            form.watch(`categories.${categoryIndex}.elements`).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No elements added to this category yet.
              </p>
            ) : (
              <AnimatePresence mode="popLayout">
                {form
                  .watch(`categories.${categoryIndex}.elements`)
                  ?.map((_, elementIndex: number) => (
                    <motion.div
                      key={elementIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border bg-background rounded-md p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium">
                          Element #{elementIndex + 1}
                        </h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-red-50 hover:text-red-500"
                          onClick={() => {
                            const elements =
                              form.getValues(
                                `categories.${categoryIndex}.elements`
                              ) || [];
                            form.setValue(
                              `categories.${categoryIndex}.elements`,
                              elements.filter(
                                (_, i: number) => i !== elementIndex
                              )
                            );
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`categories.${categoryIndex}.elements.${elementIndex}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Element Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Hardwood Floor"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`categories.${categoryIndex}.elements.${elementIndex}.markup_percentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Markup %</FormLabel>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`categories.${categoryIndex}.elements.${elementIndex}.material_cost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Material Cost</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 5.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`categories.${categoryIndex}.elements.${elementIndex}.labor_cost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Labor Cost</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    );
  }