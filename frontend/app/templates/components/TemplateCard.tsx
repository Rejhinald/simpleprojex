"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TemplateWithDetails, 
  formatDate 
} from "../utils/template-utils";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  LayoutGrid,
  Variable as VariableIcon,
  List
} from "lucide-react";
import { useEffect, useState } from "react";
import { categoryApi, Element } from "../../api/apiService";
import { useTemplateContext } from '../contexts/TemplateContext';

interface TemplateCardProps {
    template: TemplateWithDetails;
    isExpanded: boolean;
    isLoading: boolean;
    onDelete: (id: number) => void;
    onToggleExpand: (id: number, e: React.MouseEvent) => void;
    categoryElements: Record<number, Element[]>;
    setCategoryElements: React.Dispatch<React.SetStateAction<Record<number, Element[]>>>;
  }
  

  export function TemplateCard({ 
    template, 
    isLoading, 
    onDelete,
    categoryElements,
    setCategoryElements 
  }: TemplateCardProps) {
    const { expandedId, setExpandedId } = useTemplateContext();
    const isExpanded = expandedId === template.id;
    const [loadingElements, setLoadingElements] = useState<Record<number, boolean>>({});

  // Calculate stats with actual elements
  const getStats = () => {
    const variableCount = template.variables?.length || 0;
    const categoryCount = template.categories?.length || 0;
    const elementCount = template.categories?.reduce((total, category) => {
      return total + (categoryElements[category.id]?.length || 0);
    }, 0) || 0;

    return { variableCount, categoryCount, elementCount };
  };

  const { variableCount, categoryCount, elementCount } = getStats();

  // Load elements immediately when component mounts
  useEffect(() => {
    const loadCategoryElements = async () => {
      if (template.categories && template.categories.length > 0) {
        for (const category of template.categories) {
          if (!categoryElements[category.id] && !loadingElements[category.id]) {
            setLoadingElements(prev => ({ ...prev, [category.id]: true }));
            try {
              const elements = await categoryApi.listElements(category.id);
              setCategoryElements(prev => ({ ...prev, [category.id]: elements }));
            } catch (error) {
              console.error(`Failed to load elements for category ${category.id}:`, error);
            } finally {
              setLoadingElements(prev => ({ ...prev, [category.id]: false }));
            }
          }
        }
      }
    };

    loadCategoryElements();
  }, [template.categories, categoryElements, loadingElements]);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedId(isExpanded ? null : template.id);
  };

  const anyElementsLoading = template.categories?.some(category => loadingElements[category.id]) || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="overflow-hidden transition-all hover:shadow-md border border-gray-200/80 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-1">{template.name}</CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0">
              Template
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {template.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Clock className="mr-1 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">Created {formatDate(template.created_at)}</span>
          </div>
          
          {/* Template Stats */}
          <div className="mt-auto">
            <motion.div
              initial={false}
              animate={{ 
                height: isExpanded ? 'auto' : '80px',
              }}
              className="border-t mt-2 pt-2 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 text-sm text-center">
                <div className="flex flex-col items-center border p-2 rounded-md">
                  <span className="font-medium">Variables</span>
                  <span className="text-xl">{variableCount}</span>
                </div>
                <div className="flex flex-col items-center border p-2 rounded-md">
                  <span className="font-medium">Categories</span>
                  <span className="text-xl">{categoryCount}</span>
                </div>
                <div className="flex flex-col items-center border p-2 rounded-md">
                  <span className="font-medium">Elements</span>
                  <span className="text-xl">{elementCount}</span>
                </div>
              </div>
              
              <motion.div
                initial={false}
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  height: isExpanded ? 'auto' : 0,
                }}
                transition={{
                  height: { duration: 0.3 },
                  opacity: { duration: 0.2, delay: isExpanded ? 0.1 : 0 }
                }}
                className="mt-4 space-y-3"
              >
                <AnimatePresence>
                  {isLoading || anyElementsLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center py-4"
                    >
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </motion.div>
                  ) : (
                    <>
                      {variableCount > 0 && template.variables && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h4 className="font-medium text-sm mb-1 flex items-center">
                            <VariableIcon className="h-3.5 w-3.5 mr-1 text-blue-500" />
                            Variables
                          </h4>
                          <div className="flex flex-wrap gap-1 pl-5">
                            {template.variables.map(variable => (
                              <Badge key={variable.id} variant="outline" className="text-xs">
                                {variable.name} ({variable.type.replace('_', ' ').toLowerCase()})
                              </Badge>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      
                      {categoryCount > 0 && template.categories && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="space-y-3"
                        >
                          <h4 className="font-medium text-sm mb-1 flex items-center">
                            <LayoutGrid className="h-3.5 w-3.5 mr-1 text-blue-500" />
                            Categories & Elements
                          </h4>
                          <div className="pl-2 space-y-2">
                            {template.categories.map(category => (
                              <div key={category.id} className="border-l-2 border-blue-100 pl-3 py-1">
                                <h5 className="text-sm font-medium">{category.name}</h5>
                                {categoryElements[category.id]?.length > 0 ? (
                                  <div className="mt-1 pl-2">
                                    <p className="text-xs text-muted-foreground flex items-center">
                                      <List className="h-3 w-3 mr-1" />
                                      Elements:
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {categoryElements[category.id].map(element => (
                                        <Badge key={element.id} variant="outline" className="text-xs">
                                          {element.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground mt-1 pl-2">
                                    No elements
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0 pb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <a href={`/templates/${template.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </a>
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={handleToggleExpand}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Details
                </>
              )}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete(template.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}