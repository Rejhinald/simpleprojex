"use client";

import { motion } from "framer-motion";
import { X, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "./TemplateCard";
import { TemplateWithDetails } from "../utils/template-utils";
import { useTemplateContext } from '../contexts/TemplateContext';
import { Element } from '@/app/api/apiService';

interface TemplateListProps {
    templates: TemplateWithDetails[];
    error: string | null;
    detailsLoading: Record<number, boolean>;
    onRetry: () => void;
    onDelete: (id: number) => void;
    searchQuery: string;
    hasFilters: boolean;
    categoryElements: Record<number, Element[]>;
    setCategoryElements: React.Dispatch<React.SetStateAction<Record<number, Element[]>>>;
    onCreateNew: () => void;
  }


  export function TemplateList({
    templates,
    error,
    detailsLoading,
    onRetry,
    onDelete,
    onCreateNew,
    searchQuery,
    hasFilters,
    categoryElements,
    setCategoryElements
  }: TemplateListProps) {
  const { expandedId, setExpandedId } = useTemplateContext();
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800 w-full">
        <div className="flex">
          <X className="h-5 w-5 text-red-500 mr-2" />
          <p>Error: {error}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-4 w-full"
      >
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No templates found</h3>
        {searchQuery || hasFilters ? (
          <p className="text-muted-foreground">
            No templates match your search criteria or filters
          </p>
        ) : (
          <p className="text-muted-foreground">
            Get started by creating your first template
          </p>
        )}
        <Button 
          className="mt-2 bg-blue-600 hover:bg-blue-700"
          onClick={onCreateNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Template
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 w-full"
    >
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          isExpanded={expandedId === template.id}
          onToggleExpand={() => setExpandedId(expandedId === template.id ? null : template.id)}
          isLoading={detailsLoading[template.id] || false}
          onDelete={onDelete}
          categoryElements={categoryElements}
          setCategoryElements={setCategoryElements}
        />
      ))}
    </motion.div>
  );
}