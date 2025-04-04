"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { templateApi, PaginatedResponse, Element } from "../../api/apiService";
import { toast } from "sonner";
import { 
  TemplateWithDetails, 
  TemplateFilters, 
  searchInTemplate,
  filterByContent,
  filterByDate,
  sortTemplates
} from "../utils/template-utils";

// Key used for template refresh notifications
const TEMPLATE_REFRESH_KEY = "last_template_refresh";

export function useTemplates(categoryElements: Record<number, Element[]>) {
  const [templates, setTemplates] = useState<TemplateWithDetails[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailsLoading, setDetailsLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedTemplates, setExpandedTemplates] = useState<Record<number, boolean>>({});
  
  // Track the last refresh timestamp to prevent duplicate refreshes
  const lastRefreshTimeRef = useRef<string | null>(null);

  const loadTemplateDetails = async (id: number): Promise<void> => {
    if (detailsLoading[id] || templates.find(t => t.id === id)?.variables || templates.find(t => t.id === id)?.categories) {
      return; // Already loading or already loaded
    }

    try {
      setDetailsLoading(prev => ({ ...prev, [id]: true }));
      const [variables, categories] = await Promise.all([
        templateApi.listVariables(id),
        templateApi.listCategories(id)
      ]);

      const updateTemplateWithDetails = (template: TemplateWithDetails) =>
        template.id === id ? { ...template, variables, categories } : template;

      setTemplates(prev => prev.map(updateTemplateWithDetails));
      setFilteredTemplates(prev => prev.map(updateTemplateWithDetails));
    } catch (err) {
      toast.error(`Failed to load template details: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setDetailsLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const loadTemplates = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data: PaginatedResponse<TemplateWithDetails> = await templateApi.list();
      const templates = data.items || [];
      setTemplates(templates);
      setFilteredTemplates(templates);
      setError(null);

      // Automatically load details for all templates
      const templateIds = templates.map(template => template.id);
      await Promise.all(templateIds.map(loadTemplateDetails));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllTemplateDetails = async (): Promise<void> => {
    const templatesNeedingDetails = templates.filter(
      t => !t.variables && !t.categories
    );
    
    if (templatesNeedingDetails.length === 0) return;
    
    try {
      const updatedTemplates = [...templates];
      
      await Promise.all(templatesNeedingDetails.map(async (template) => {
        setDetailsLoading(prev => ({ ...prev, [template.id]: true }));
        
        try {
          const [variables, categories] = await Promise.all([
            templateApi.listVariables(template.id),
            templateApi.listCategories(template.id)
          ]);
          
          const index = updatedTemplates.findIndex(t => t.id === template.id);
          if (index !== -1) {
            updatedTemplates[index] = { ...updatedTemplates[index], variables, categories };
          }
        } catch (error) {
          console.error(`Failed to load details for template ${template.id}:`, error);
        } finally {
          setDetailsLoading(prev => ({ ...prev, [template.id]: false }));
        }
      }));
      
      setTemplates(updatedTemplates);
      setFilteredTemplates(updatedTemplates);
    } catch (error) {
      console.error("Failed to load template details for search:", error);
      toast.error("Failed to load template details for search");
    }
  };

  const deleteTemplate = async (id: number): Promise<boolean> => {
    try {
      await templateApi.delete(id);
      
      // Set refresh marker for other components
      const timestamp = Date.now().toString();
      lastRefreshTimeRef.current = timestamp;
      localStorage.setItem(TEMPLATE_REFRESH_KEY, timestamp);
      
      // Reload templates in this component
      await loadTemplates();
      
      toast.success("Template deleted successfully");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Failed to delete template");
      return false;
    }
  };

  const toggleTemplateExpand = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedTemplates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filterTemplates = useCallback((query: string, filters: TemplateFilters) => {
    if (!templates) return;

    let result = templates.filter(template => {
      // Basic search in name and description
      if (!query) return true;
      
      // Pass categoryElements to searchInTemplate
      return searchInTemplate(template, query, filters.searchIn, categoryElements);
    });
    
    // Step 2: Apply content filters
    result = result.filter(template => filterByContent(template, filters));
    
    // Step 3: Apply date filters
    result = result.filter(template => filterByDate(template, filters));
    
    // Step 4: Apply sorting
    result = sortTemplates(result, filters.sortBy, filters.sortDirection);
    
    setFilteredTemplates(result);
  }, [templates, categoryElements]);

  // Listen for localStorage changes to detect refreshes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TEMPLATE_REFRESH_KEY && e.newValue && e.newValue !== lastRefreshTimeRef.current) {
        lastRefreshTimeRef.current = e.newValue;
        loadTemplates();
      }
    };
    
    // Check once on mount
    const checkForRefreshMarker = () => {
      const timestamp = localStorage.getItem(TEMPLATE_REFRESH_KEY);
      if (timestamp && timestamp !== lastRefreshTimeRef.current) {
        lastRefreshTimeRef.current = timestamp;
        localStorage.removeItem(TEMPLATE_REFRESH_KEY);
        loadTemplates();
      }
    };
    
    checkForRefreshMarker();
    
    // Listen for future changes
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadTemplates]);

  // Function to manually trigger a refresh
  const refreshTemplates = useCallback(() => {
    // Set refresh marker
    const timestamp = Date.now().toString();
    lastRefreshTimeRef.current = timestamp;
    localStorage.setItem(TEMPLATE_REFRESH_KEY, timestamp);
    
    // Reload templates
    return loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    filteredTemplates,
    loading,
    error,
    detailsLoading,
    expandedTemplates,
    loadTemplates,
    refreshTemplates,  // New function to manually trigger refresh
    loadAllTemplateDetails,
    deleteTemplate,
    toggleTemplateExpand,
    filterTemplates,
  };
}