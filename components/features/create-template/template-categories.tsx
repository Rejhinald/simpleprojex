"use client";

import { useState, useEffect } from "react";
import { 
  Button, 
  Card, 
  Input, 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/shared";
import { PlusCircle, XCircle, Plus, Check, ChevronsUpDown } from "lucide-react";
import { Category, Element, Template, TemplateCategoriesProps } from "@/types/templates";
import { useCategories } from "@/hooks/api/lookup/use-categories";

export default function TemplateCategories({ template, onUpdateTemplate, onNext, onPrevious }: TemplateCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(template.categories || []);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { modules, isLoading, error } = useCategories();
  
  const filteredModules = modules?.filter((module) => 
    module.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const [elementName, setElementName] = useState("");
  const [materialCostFormula, setMaterialCostFormula] = useState("");
  const [laborCostFormula, setLaborCostFormula] = useState("");
  
  useEffect(() => {
    setCategories(template.categories || []);
  }, [template.categories]);
  useEffect(() => {
    if (categories.length > 0 || template.categories?.length > 0) {
      onUpdateTemplate({
        ...template,
        categories
      });
    }
  }, [categories]);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: categories.length + 1,
      name: newCategoryName,
      elements: []
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    setNewCategoryName("");
    setSelectedCategory(newCategory.id);

    onUpdateTemplate({
      ...template,
      categories: updatedCategories
    });
  };

  const removeCategory = (id: number) => {
    const updatedCategories = categories.filter((category: Category) => category.id !== id);
    setCategories(updatedCategories);
    setSelectedCategory(null);

    onUpdateTemplate({
      ...template,
      categories: updatedCategories
    });
  };

  const addElement = (categoryId: number) => {
    if (!elementName.trim()) return;
    
    const updatedCategories = categories.map((category: Category) => {
      if (category.id === categoryId) {
        const newElement: Element = {
          id: (category.elements.length > 0 ? Math.max(...category.elements.map((el: Element) => el.id)) : 0) + 1,
          name: elementName,
          material_cost: materialCostFormula,
          labor_cost: laborCostFormula
        };
        
        return {
          ...category,
          elements: [...category.elements, newElement]
        };
      }
      return category;
    });
    
    setCategories(updatedCategories);
    setElementName("");
    setMaterialCostFormula("");
    setLaborCostFormula("");
    
    // Update the template
    onUpdateTemplate({
      ...template,
      categories: updatedCategories
    });
  };

  const removeElement = (categoryId: number, elementId: number) => {
    const updatedCategories = categories.map((category: Category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          elements: category.elements.filter((element: Element) => element.id !== elementId)
        };
      }
      return category;
    });
    
    setCategories(updatedCategories);
    
    // Update the template
    onUpdateTemplate({
      ...template,
      categories: updatedCategories
    });
  };

  const handleSaveAndContinue = () => {
    onUpdateTemplate({
      ...template,
      categories
    });
    onNext();
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Template Categories</h2>
      <p className="text-gray-600 mb-4">
        Create categories and define elements with cost formulas for your template.
      </p>

      <div className="space-y-6">
    
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={addCategory} className="flex-1">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="flex-1 justify-between">
                  <span>Select Category</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search categories..." 
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandEmpty>
                    {isLoading ? "Loading..." : "No categories found."}
                  </CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {error ? (
                      <div className="p-2 text-center text-red-500 text-sm">
                        Error loading categories
                      </div>
                    ) : filteredModules.length === 0 && !isLoading ? (
                      <div className="p-2 text-center text-sm">
                        No matching categories
                      </div>
                    ) : (
                      filteredModules.map((module) => {
                        // Check if this category is already added
                        const isSelected = categories.some(
                          (cat) => cat.name === module.name
                        );
                        
                        return (
                          <CommandItem
                            key={module.id}
                            value={module.name}
                            onSelect={() => {
                              if (!isSelected) {
                                // Add category if not already selected
                                const newCategory = {
                                  id: categories.length + 1,
                                  name: module.name,
                                  elements: module.elements?.map(elem => ({
                                    id: elem.id,
                                    name: elem.name,
                                    material_cost: elem.material_cost || '',
                                    labor_cost: elem.labor_cost || ''
                                  })) || []
                                };
                                
                                const updatedCategories = [...categories, newCategory];
                                setCategories(updatedCategories);
                                
                                // Update the template
                                onUpdateTemplate({
                                  ...template,
                                  categories: updatedCategories
                                });
                              } else {
                                // Remove category if already selected
                                const updatedCategories = categories.filter(
                                  (cat) => cat.name !== module.name
                                );
                                setCategories(updatedCategories);
                                
                                // Update the template
                                onUpdateTemplate({
                                  ...template,
                                  categories: updatedCategories
                                });
                              }
                              // Keep dropdown open for multiple selections
                              // setOpen(false);
                            }}
                          >
                            <div className="flex flex-1 items-center justify-between">
                              <div>
                                <span className="font-medium">{module.name}</span>
                                <span className="block text-xs text-gray-400 mt-1">
                                  {module.elements?.length || 0} elements
                                </span>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-black" />}
                            </div>
                          </CommandItem>
                        );
                      })
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Categories and Elements */}
        {categories.length > 0 && (
          <Accordion type="single" collapsible>
            {categories.map((category) => (
              <AccordionItem key={category.id} value={`category-${category.id}`}>
                <div className="flex items-center justify-between pr-3">
                  <AccordionTrigger className="flex-grow">
                    {category.name}
                  </AccordionTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(category.id);
                    }}
                  >
                    <XCircle className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
                <AccordionContent>
                  <div className="p-4 border rounded-md mt-2 mb-4">
                    <h4 className="font-medium mb-3">Add New Element</h4>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`element-name-${category.id}`} className="block text-sm mb-1">
                          Element Name
                        </label>
                        <Input
                          id={`element-name-${category.id}`}
                          value={elementName}
                          onChange={(e) => setElementName(e.target.value)}
                          placeholder="e.g. Wall Framing"
                        />
                      </div>
                      <div>
                        <label htmlFor={`material-cost-${category.id}`} className="block text-sm mb-1">
                          Material Cost Formula
                        </label>
                        <Input
                          id={`material-cost-${category.id}`}
                          value={materialCostFormula}
                          onChange={(e) => setMaterialCostFormula(e.target.value)}
                          placeholder="e.g. Wall Length * Wall Width * Material Cost"
                        />
                      </div>
                      <div>
                        <label htmlFor={`labor-cost-${category.id}`} className="block text-sm mb-1">
                          Labor Cost Formula
                        </label>
                        <Input
                          id={`labor-cost-${category.id}`}
                          value={laborCostFormula}
                          onChange={(e) => setLaborCostFormula(e.target.value)}
                          placeholder="e.g. Wall Length * Wall Width * Hourly Rate"
                        />
                      </div>
                      <Button size="sm" onClick={() => addElement(category.id)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Element
                      </Button>
                    </div>

                    {/* List of elements */}
                    {category.elements.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Elements</h4>
                        <div className="border rounded-md divide-y">
                          {category.elements.map((element) => (
                            <div
                              key={element.id}
                              className="p-3"
                            >
                              <div className="flex justify-between items-start">
                                <h5 className="font-medium">{element.name}</h5>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeElement(category.id, element.id)}
                                >
                                  <XCircle className="h-5 w-5 text-red-500" />
                                </Button>
                              </div>
                              <div className="mt-2 space-y-1 text-sm">
                                <p><span className="font-medium">Material Cost:</span> {element.material_cost}</p>
                                <p><span className="font-medium">Labor Cost:</span> {element.labor_cost}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={handleSaveAndContinue}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
