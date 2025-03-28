"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ElementValue } from "@/app/api/apiService";
import { slideUp } from "@/app/templates/utils/template-utils";

interface CategoryTotals {
  materialCost: number;
  laborCost: number;
  totalWithMarkup: number;
  elementCount: number;
  categoryId?: number;
}

interface Category {
  id: number;
  name: string;
  position: number;
  elements: ElementValue[];
  totals?: CategoryTotals; // Make this optional to maintain backward compatibility
}

interface ElementCategoryProps {
  categories: Category[];
  proposalId: number;
  onRefresh: () => Promise<void>;
  onEditElement: (element: ElementValue) => void;
  onDeleteElement: (element: ElementValue) => void;
}

export function ElementCategory({
    categories,
    onEditElement,
    onDeleteElement
  }: ElementCategoryProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
      // Default to all categories expanded
      categories.reduce((acc, category) => {
        acc[category.name] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );
  
    const toggleCategory = (categoryName: string) => {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryName]: !prev[categoryName]
      }));
    };
  
    if (categories.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No elements or categories found.
        </div>
      );
    }
  
    return (
      <AnimatePresence>
        {categories.map((category) => {
          // Filter out placeholder elements
          const filteredElements = category.elements.filter(
            element => 
              element.element_name !== "__category_placeholder__" && 
              element.element_name !== "Category Placeholder"
          );
          
          // Sort elements by position
          const sortedElements = [...filteredElements].sort((a, b) => 
            (a.position || 0) - (b.position || 0)
          );
          
          // Calculate totals for real elements only
          const filteredTotal = filteredElements.reduce(
            (sum, element) => sum + (element.total_with_markup || 0), 
            0
          );
          
          return (
            <motion.div
              key={category.name}
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg overflow-hidden mb-4"
            >
              <div 
                className="bg-card/90 px-4 py-3 flex justify-between items-center border-b cursor-pointer"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{category.name}</h3>
                  <Badge variant="outline" className="bg-secondary/30 dark:bg-secondary/20 text-xs font-normal">
                    {filteredElements.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground mr-2">
                    {/* Use pre-calculated totals if available, otherwise use filtered total */}
                    Total: ${category.totals 
                      ? category.totals.totalWithMarkup.toFixed(2)
                      : filteredTotal.toFixed(2)
                    }
                  </div>
                  {expandedCategories[category.name] ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              {expandedCategories[category.name] && sortedElements.length > 0 && (
                <div className="divide-y">
                  {sortedElements.map((element) => (
                    <div 
                      key={element.element_id} 
                      className="p-4 bg-card hover:bg-muted/5 transition-colors"
                    >
                      <div className="flex justify-between mb-3">
                        <h4 className="font-medium">
                          {element.element_name}
                          {element.position !== undefined && 
                            <span className="text-xs ml-2 text-muted-foreground">
                              (Position: {element.position})
                            </span>
                          }
                        </h4>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent category toggle
                              onEditElement(element);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent category toggle
                              onDeleteElement(element);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Material:</span>
                          <div className="font-medium mt-1">
                            ${parseFloat(element.calculated_material_cost).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Labor:</span>
                          <div className="font-medium mt-1">
                            ${parseFloat(element.calculated_labor_cost).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Markup:</span>
                          <div className="font-medium mt-1">
                            {parseFloat(element.markup_percentage).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-right">
                        <div className="text-sm text-muted-foreground">
                          Subtotal: ${(element.total_cost || 0).toFixed(2)}
                        </div>
                        <div className="font-semibold">
                          Total: ${(element.total_with_markup || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    );
  }