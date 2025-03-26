"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useTemplates } from "./hooks/useTemplates";
import { Element } from "@/app/api/apiService";
import { TemplateFilters, defaultFilters } from "./utils/template-utils";
import { CreateTemplateDialog } from "./components/CreateTemplateDialog";
import { TemplateFiltersBar } from "./components/TemplateFilters";
import { TemplateList } from "./components/TemplateList";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";
import { TemplateSkeletons } from "./components/LoadingSkeletons";
import { TemplateProvider } from "./contexts/TemplateContext";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<TemplateFilters>(defaultFilters);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [categoryElements, setCategoryElements] = useState<Record<number, Element[]>>({});

  const { 
    filteredTemplates,
    loading,
    error,
    detailsLoading,
    loadTemplates,
    deleteTemplate,
    filterTemplates
  } = useTemplates(categoryElements); // Pass categoryElements here

  useEffect(() => {
    void loadTemplates();
  }, []);
  
  useEffect(() => {
    filterTemplates(searchQuery, filters);
  }, [searchQuery, filters]);
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFiltersChange = (newFilters: TemplateFilters) => {
    setFilters(newFilters);
  };
  
  const handleDeleteClick = (id: number) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (templateToDelete === null) return;
    
    const success = await deleteTemplate(templateToDelete);
    if (success) {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };
  
  const hasActiveFilters = () => {
    return filters.showRecent || 
           filters.hasCategories || 
           filters.hasVariables || 
           filters.variableTypes.length > 0 ||
           Object.values(filters.searchIn).some(value => value !== defaultFilters.searchIn.name);
  };
  
  return (
    <TemplateProvider>
      <div className="w-full h-full flex flex-col flex-1">
        {/* Header with title and create button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-8 gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold tracking-tight"
            >
              Templates
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 } }}
              className="text-muted-foreground mt-1"
            >
              Manage and create project templates
            </motion.p>
          </div>

          <CreateTemplateDialog onTemplateCreated={loadTemplates} />
        </div>
        
        {/* Search and filter area */}
        <TemplateFiltersBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categoryElements={categoryElements}
          setCategoryElements={setCategoryElements}
        />
        
        <Separator className="mb-8 w-full" />
        
        {/* Content section */}
        <div className="w-full flex-1 pb-8">
        {loading ? (
          <TemplateSkeletons />
        ) : (
          <TemplateList
            templates={filteredTemplates}
            error={error}
            detailsLoading={detailsLoading}
            onRetry={loadTemplates}
            onDelete={handleDeleteClick}
            onCreateNew={() => {
              document.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')?.click();
            }}
            searchQuery={searchQuery}
            hasFilters={hasActiveFilters()}
            categoryElements={categoryElements}
            setCategoryElements={setCategoryElements}
          />
        )}
      </div>
        
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
        />
      </div>
    </TemplateProvider>
  );
}