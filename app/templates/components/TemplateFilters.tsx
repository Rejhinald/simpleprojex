"use client";

import { motion } from "framer-motion";
import { Search, Filter, Calendar, VariableIcon, Layers, CircleDot, Tag, FileText, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TemplateFilters, defaultFilters, hasSearchFilters } from "../utils/template-utils";
import { useEffect, useState, useMemo } from 'react';
import { categoryApi, Element, templateApi } from '../../api/apiService';

interface TemplateFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: TemplateFilters;
    onFiltersChange: (filters: TemplateFilters) => void;
    categoryElements: Record<number, Element[]>;
    setCategoryElements: React.Dispatch<React.SetStateAction<Record<number, Element[]>>>;
  }

  export function TemplateFiltersBar({
    searchQuery,
    onSearchChange,
    filters,
    onFiltersChange,
    categoryElements,
    setCategoryElements,
  }: TemplateFiltersProps) {
    const [loadingElements, setLoadingElements] = useState<Record<number, boolean>>({});

  // Load elements when component mounts
  useEffect(() => {
    const loadElements = async () => {
      if (!categoryElements || Object.keys(categoryElements).length === 0) {
        // Only load if we don't already have elements
        try {
          const templates = await templateApi.list();
          for (const template of templates.items) {
            const categories = await templateApi.listCategories(template.id);
            for (const category of categories) {
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
        } catch (error) {
          console.error('Failed to load elements:', error);
        }
      }
    };

    loadElements();
  }, [categoryElements, setCategoryElements]);

  // Create a flattened array of all elements for searching
  const allElements = useMemo(() => {
    return Object.values(categoryElements).flat();
  }, [categoryElements]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-8"
    >
      <div className="relative w-full sm:max-w-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              className="pl-10 w-full pr-28"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onSearchChange('')}
                className="absolute right-[70px] top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50 text-muted-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 text-xs text-muted-foreground"
                >
                  {hasSearchFilters(filters) ? "Advanced" : "In: All"} 
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <h4 className="font-medium text-sm mb-2">Search in:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox 
                        id="search-name" 
                        checked={filters.searchIn.name}
                        onCheckedChange={(checked) => 
                          onFiltersChange({...filters, searchIn: {...filters.searchIn, name: checked === true}})
                        }
                        className="mr-2"
                      />
                      <label htmlFor="search-name" className="text-sm flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" /> Template name
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="search-desc" 
                        checked={filters.searchIn.description}
                        onCheckedChange={(checked) => 
                          onFiltersChange({...filters, searchIn: {...filters.searchIn, description: checked === true}})
                        }
                        className="mr-2"
                      />
                      <label htmlFor="search-desc" className="text-sm flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Description
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="search-variables" 
                        checked={filters.searchIn.variables}
                        onCheckedChange={(checked) => 
                          onFiltersChange({...filters, searchIn: {...filters.searchIn, variables: checked === true}})
                        }
                        className="mr-2"
                      />
                      <label htmlFor="search-variables" className="text-sm flex items-center gap-1">
                        <VariableIcon className="h-3.5 w-3.5" /> Variable names
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="search-categories" 
                        checked={filters.searchIn.categories}
                        onCheckedChange={(checked) => 
                          onFiltersChange({...filters, searchIn: {...filters.searchIn, categories: checked === true}})
                        }
                        className="mr-2"
                      />
                      <label htmlFor="search-categories" className="text-sm flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" /> Category names
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="search-elements" 
                        checked={filters.searchIn.elements}
                        onCheckedChange={(checked) => {
                          onFiltersChange({
                            ...filters, 
                            searchIn: {
                              ...filters.searchIn, 
                              elements: checked === true
                            }
                          });
                        }}
                        className="mr-2"
                      />
                      <label htmlFor="search-elements" className="text-sm flex items-center gap-1">
                        <CircleDot className="h-3.5 w-3.5" /> 
                        Element names {allElements.length > 0 && `(${allElements.length})`}
                      </label>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filters
              {(filters.hasVariables || filters.hasCategories || filters.variableTypes.length > 0) && (
                <Badge className="ml-1 h-5 px-1 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                  {(filters.hasVariables ? 1 : 0) + 
                   (filters.hasCategories ? 1 : 0) + 
                   (filters.variableTypes.length > 0 ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Options</h4>
              
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Show templates
                </h5>
                <div className="pl-5 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="recent" 
                      checked={filters.showRecent}
                      onCheckedChange={(checked) => 
                        onFiltersChange({...filters, showRecent: checked === true})
                      }
                    />
                    <label htmlFor="recent" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      From the last 7 days
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-2">Template contents</h5>
                <div className="pl-5 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="has-variables" 
                      checked={filters.hasVariables}
                      onCheckedChange={(checked) => 
                        onFiltersChange({...filters, hasVariables: checked === true})
                      }
                    />
                    <label htmlFor="has-variables" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Has variables
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="has-categories" 
                      checked={filters.hasCategories}
                      onCheckedChange={(checked) => 
                        onFiltersChange({...filters, hasCategories: checked === true})
                      }
                    />
                    <label htmlFor="has-categories" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Has categories
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-2">Variable Types</h5>
                <div className="pl-5 space-y-2">
                  {['SQUARE_FEET', 'LINEAR_FEET', 'COUNT', 'CUBIC_FEET'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`var-${type.toLowerCase()}`} 
                        checked={filters.variableTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          const types = [...filters.variableTypes];
                          if (checked) {
                            if (!types.includes(type)) types.push(type);
                          } else {
                            const index = types.indexOf(type);
                            if (index !== -1) types.splice(index, 1);
                          }
                          onFiltersChange({...filters, variableTypes: types});
                        }}
                      />
                      <label htmlFor={`var-${type.toLowerCase()}`} className="text-sm leading-none">
                        {type.replace('_', ' ').toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-2">Sort by</h5>
                <RadioGroup 
                  value={`${filters.sortBy}:${filters.sortDirection}`} 
                  onValueChange={(value) => {
                    const [sortBy, sortDirection] = value.split(':');
                    onFiltersChange({
                      ...filters, 
                      sortBy: sortBy as 'name' | 'created_at',
                      sortDirection: sortDirection as 'asc' | 'desc'
                    });
                  }}
                  className="pl-5 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name:asc" id="name-asc" />
                    <Label htmlFor="name-asc" className="text-sm">
                      Name (A-Z)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name:desc" id="name-desc" />
                    <Label htmlFor="name-desc" className="text-sm">
                      Name (Z-A)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="created_at:desc" id="date-desc" />
                    <Label htmlFor="date-desc" className="text-sm">
                      Date (newest first)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="created_at:asc" id="date-asc" />
                    <Label htmlFor="date-asc" className="text-sm">
                      Date (oldest first)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                className="w-full text-xs h-8" 
                variant="outline"
                onClick={() => onFiltersChange(defaultFilters)}
              >
                Reset Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Tabs 
          defaultValue="all" 
          value={filters.showRecent ? "recent" : "all"}
          onValueChange={(value) => {
            onFiltersChange({
              ...filters,
              showRecent: value === "recent"
            });
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-2 w-full sm:w-[200px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </motion.div>
  );
}