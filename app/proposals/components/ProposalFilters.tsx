"use client";

import { motion } from "framer-motion";
import { Search, Filter, Calendar, Tag, ChevronDown, X, Component } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProposalFilters, defaultFilters, hasAdvancedSearch } from "../utils/proposal-utils";

interface ProposalFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: ProposalFilters;
  onFiltersChange: (filters: ProposalFilters) => void;
}

export function ProposalFiltersBar({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}: ProposalFiltersProps) {
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
              placeholder="Search proposals..."
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
                  {hasAdvancedSearch(filters) ? "Advanced" : "In: All"} 
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
                        <Tag className="h-3.5 w-3.5" /> Proposal name
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="search-templates" 
                        checked={filters.searchIn.templatesUsed}
                        onCheckedChange={(checked) => 
                          onFiltersChange({...filters, searchIn: {...filters.searchIn, templatesUsed: checked === true}})
                        }
                        className="mr-2"
                      />
                      <label htmlFor="search-templates" className="text-sm flex items-center gap-1">
                        <Component className="h-3.5 w-3.5" /> Template names
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
              {(filters.hasTemplate) && (
                <Badge className="ml-1 h-5 px-1 bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                  1
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
                  Show proposals
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
                <h5 className="text-sm font-medium mb-2">Proposal content</h5>
                <div className="pl-5 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="has-template" 
                      checked={filters.hasTemplate}
                      onCheckedChange={(checked) => 
                        onFiltersChange({...filters, hasTemplate: checked === true})
                      }
                    />
                    <label htmlFor="has-template" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Created from template
                    </label>
                  </div>
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