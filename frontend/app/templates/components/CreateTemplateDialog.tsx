"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Plus,
  ListPlus,
  Check,
  X,
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { templateApi, categoryApi } from "../../api/apiService";
import { fadeIn, slideUp } from "../utils/template-utils";

// Form schema definition
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Template name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  categories: z.array(z.object({
    name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
    position: z.number(),
    elements: z.array(z.object({
      name: z.string().min(2, { message: "Element name must be at least 2 characters." }),
      material_cost: z.string(),
      labor_cost: z.string(),
      markup_percentage: z.number().min(0).max(100),
      position: z.number()
    }))
  })),
  variables: z.array(z.object({
    name: z.string().min(2, { message: "Variable name must be at least 2 characters." }),
    type: z.enum(["LINEAR_FEET", "SQUARE_FEET", "CUBIC_FEET", "COUNT"])
  }))
});

interface CreateTemplateDialogProps {
  onTemplateCreated: () => void;
}

export function CreateTemplateDialog({ onTemplateCreated }: CreateTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      categories: [],
      variables: []
    },
  });

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setActiveTab("basic");
      setCreationProgress(0);
    }
  };

  const goToNextTab = async () => {
    if (activeTab === "basic") {
      // Validate basic info before proceeding
      const basicInfoValid = await form.trigger(["name", "description"]);
      if (basicInfoValid) {
        setActiveTab("variables");
      }
    } else if (activeTab === "variables") {
      setActiveTab("categories");
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "variables") {
      setActiveTab("basic");
    } else if (activeTab === "categories") {
      setActiveTab("variables");
    }
  };

  const createBasicTemplate = async () => {
    const isValid = await form.trigger(["name", "description"]);
    if (!isValid) return;
    
    setIsCreating(true);
    setCreationProgress(20);
    
    try {
      const values = form.getValues();
      await templateApi.create({
        name: values.name,
        description: values.description || "",
      });
      
      setCreationProgress(100);
      onTemplateCreated();
      toast.success("Basic template created successfully");
      
      setTimeout(() => {
        setIsOpen(false);
        setCreationProgress(0);
      }, 500);
    } catch (error) {
      console.error("Template creation failed:", error);
      toast.error("Failed to create template");
      setCreationProgress(0);
    } finally {
      setIsCreating(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);
    setCreationProgress(10); // Start progress
    
    try {
      // First create the template
      setCreationProgress(20);
      const template = await templateApi.create({
        name: values.name,
        description: values.description || "",
      });
      
      setCreationProgress(40);
      
      // Create variables
      if (values.variables?.length) {
        setCreationProgress(60);
        await Promise.all(
          values.variables.map(variable =>
            templateApi.createVariable(template.id, {
              name: variable.name,
              type: variable.type
            })
          )
        );
      }

      // Create categories and their elements
      if (values.categories?.length) {
        setCreationProgress(80);
        for (const category of values.categories) {
          const newCategory = await templateApi.createCategory(template.id, {
            name: category.name,
            position: category.position
          });

          if (category.elements?.length) {
            await Promise.all(
              category.elements.map(element =>
                categoryApi.createElement(newCategory.id, element)
              )
            );
          }
        }
      }

      setCreationProgress(100);
      form.reset();
      onTemplateCreated();
      toast.success("Template created successfully");
      
      setTimeout(() => {
        setIsOpen(false);
        setCreationProgress(0);
      }, 500); // Wait for progress animation to complete
    } catch (error) {
      console.error("Template creation failed:", error);
      toast.error("Failed to create template");
      setCreationProgress(0);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 font-sans">
        <div className="w-full">
          {isCreating && (
            <div className="absolute inset-x-0 top-0 z-10">
              <Progress value={creationProgress} className="h-1 rounded-none" />
            </div>
          )}
          
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center gap-2">
              <ListPlus className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-xl">Create New Template</DialogTitle>
            </div>
            <DialogDescription>
              Build a custom template with variables, categories, and elements.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="px-6 py-4 max-h-[60vh]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="basic" className="space-y-6 mt-0">
                    <motion.div 
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter template name" {...field} />
                            </FormControl>
                            <FormDescription>
                              A clear name describing the template purpose.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <textarea 
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe the template purpose and contents" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Optional details about the template.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="variables" className="space-y-6 mt-0">
                    <TemplateVariablesTab form={form} />
                  </TabsContent>

                  <TabsContent value="categories" className="space-y-6 mt-0">
                    <TemplateCategoriesTab form={form} />
                  </TabsContent>
                </form>
              </Form>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="bg-muted/40 p-6 flex flex-row items-center justify-between sm:justify-between">
            <div>
              {activeTab === "basic" ? (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={createBasicTemplate}
                    disabled={isCreating}
                    className="text-xs"
                  >
                    Create Basic Template
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousTab}
                  >
                    Previous
                  </Button>
                </motion.div>
              )}
            </div>
            <div className="flex gap-2">
              {activeTab !== "categories" ? (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="button"
                    onClick={goToNextTab}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button 
                    onClick={form.handleSubmit(onSubmit)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Create Template
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Extracted Tab Components
function TemplateVariablesTab({ form }: { form: ReturnType<typeof useForm<z.infer<typeof formSchema>>> }) {
  return (
    <motion.div 
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variables</h3>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentVariables = form.getValues("variables") || [];
              form.setValue("variables", [
                ...currentVariables,
                { name: "", type: "SQUARE_FEET" }
              ]);
            }}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Variable
          </Button>
        </motion.div>
      </div>
      
      <div className="space-y-4">
        {form.watch("variables")?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No variables added yet. Variables allow you to parametrize your template.</p>
          </div>
        ) : (
          <AnimatePresence>
            {form.watch("variables")?.map((_, index: number) => (
              <motion.div 
                key={index}
                variants={slideUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, height: 0 }}
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
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select unit type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SQUARE_FEET">Square Feet</SelectItem>
                            <SelectItem value="LINEAR_FEET">Linear Feet</SelectItem>
                            <SelectItem value="COUNT">Count</SelectItem>
                            <SelectItem value="CUBIC_FEET">Cubic Feet</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8 hover:bg-red-50 hover:text-red-500"
                  onClick={() => {
                    const variables = form.getValues("variables");
                    form.setValue("variables", variables.filter((_, i: number) => i !== index));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

function TemplateCategoriesTab({ form }: { form: ReturnType<typeof useForm<z.infer<typeof formSchema>>> }) {
  return (
    <motion.div 
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Categories & Elements</h3>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentCategories = form.getValues("categories") || [];
              form.setValue("categories", [
                ...currentCategories,
                { name: "", position: currentCategories.length + 1, elements: [] }
              ]);
            }}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Category
          </Button>
        </motion.div>
      </div>
      
      <div className="space-y-6">
        {form.watch("categories")?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No categories added yet. Categories organize related elements in your template.</p>
          </div>
        ) : (
          <AnimatePresence>
            {form.watch("categories")?.map((category: z.infer<typeof formSchema>["categories"][number], categoryIndex: number) => (
              <CategoryFormItem 
                key={categoryIndex}
                form={form}
                categoryIndex={categoryIndex}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

function CategoryFormItem({ form, categoryIndex }: { form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>, categoryIndex: number }) {
  return (
    <motion.div 
      variants={slideUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, height: 0 }}
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
          className="mt-8 hover:bg-red-50 hover:text-red-500"
          onClick={() => {
            const categories = form.getValues("categories");
            form.setValue(
              "categories",
              categories.filter((_: z.infer<typeof formSchema>["categories"][number], i: number) => i !== categoryIndex)
            );
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Elements Section */}
      <div className="pl-4 border-l-2 border-blue-100 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Elements</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentElements = form.getValues(`categories.${categoryIndex}.elements`) || [];
              form.setValue(`categories.${categoryIndex}.elements`, [
                ...currentElements,
                {
                  name: "",
                  material_cost: "",
                  labor_cost: "",
                  markup_percentage: 20,
                  position: currentElements.length + 1
                }
              ]);
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Element
          </Button>
        </div>
        
        <div className="space-y-4">
          {form.watch(`categories.${categoryIndex}.elements`)?.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No elements added to this category yet.</p>
          ) : (
            <AnimatePresence>
              {form.watch(`categories.${categoryIndex}.elements`)?.map((_, elementIndex: number) => (
                <motion.div 
                  key={elementIndex}
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, height: 0 }}
                  className="border bg-background rounded-md p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h5 className="text-sm font-medium">Element #{elementIndex + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-red-50 hover:text-red-500"
                      onClick={() => {
                        const elements = form.getValues(`categories.${categoryIndex}.elements`);
                        form.setValue(
                          `categories.${categoryIndex}.elements`,
                          elements.filter((_: z.infer<typeof formSchema>["categories"][number]["elements"][number], i: number) => i !== elementIndex)
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
                            <Input placeholder="e.g., Hardwood Floor" {...field} />
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
                              onChange={e => field.onChange(parseInt(e.target.value))}
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
                          <FormLabel>Material Cost Formula</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., $5 * square_feet" {...field} />
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
                          <FormLabel>Labor Cost Formula</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., $2 * square_feet" {...field} />
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