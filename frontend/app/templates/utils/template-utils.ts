"use client";

import { Template, Variable, Category, Element } from "../../api/apiService";

export interface TemplateWithDetails extends Template {
  variables?: Variable[];
  categories?: Category[];
  elements?: Element[];
}

export interface TemplateFilters {
  sortBy: 'name' | 'created_at';
  sortDirection: 'asc' | 'desc';
  showRecent: boolean;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  hasVariables: boolean;
  hasCategories: boolean;
  variableTypes: string[];
  searchIn: {
    name: boolean;
    description: boolean;
    variables: boolean;
    categories: boolean;
    elements: boolean;
  };
}

export const defaultFilters: TemplateFilters = {
  sortBy: 'created_at',
  sortDirection: 'desc',
  showRecent: false,
  dateRange: { from: null, to: null },
  hasVariables: false,
  hasCategories: false,
  variableTypes: [],
  searchIn: {
    name: true,
    description: true,
    variables: false,
    categories: false,
    elements: false,
  }
};

export const getTemplateStats = (template: TemplateWithDetails) => {
    const variableCount = template.variables?.length || 0;
    const categoryCount = template.categories?.length || 0;
    
    // Fix the element count calculation
    const elementCount = template.categories?.reduce((total, category) => {
      if (!category.elements) return total;
      // Make sure we're working with an array
      const elements = Array.isArray(category.elements) ? category.elements : [];
      return total + elements.length;
    }, 0) || 0;
    
    return { variableCount, categoryCount, elementCount };
  };

export const getAllElements = (template: TemplateWithDetails): Element[] => {
  if (!template.categories) return [];
  
  return template.categories.reduce((elements: Element[], category) => {
    const categoryElements = category.elements as Element[];
    return categoryElements ? [...elements, ...categoryElements] : elements;
  }, []);
};

export const calculateElementTotalCost = (element: Element): number => {
  const materialCost = parseFloat(element.material_cost) || 0;
  const laborCost = parseFloat(element.labor_cost) || 0;
  const markup = element.markup_percentage / 100;
  
  const subtotal = materialCost + laborCost;
  return subtotal + (subtotal * markup);
};

export const searchInTemplate = (
    template: TemplateWithDetails,
    query: string,
    searchIn: TemplateFilters['searchIn'],
    categoryElements: Record<number, Element[]>
  ): boolean => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return true;
  
    // Check name
    if (searchIn.name && template.name.toLowerCase().includes(searchTerm)) {
      return true;
    }
  
    // Check description
    if (searchIn.description && template.description?.toLowerCase().includes(searchTerm)) {
      return true;
    }
  
    // Check variables
    if (searchIn.variables && template.variables?.some(variable => 
      variable.name.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
  
    // Check categories
    if (searchIn.categories && template.categories?.some(category => 
      category.name.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
  
    // Check elements - this is where we need to focus
    if (searchIn.elements && template.categories) {
      // Log for debugging
      console.log('Searching elements for term:', searchTerm);
      console.log('Category elements:', categoryElements);
      
      for (const category of template.categories) {
        const elements = categoryElements[category.id];
        console.log(`Elements for category ${category.id}:`, elements);
        
        if (elements?.some(element => element.name.toLowerCase().includes(searchTerm))) {
          return true;
        }
      }
    }
  
    return false;
  };
  
  export const filterByContent = (
    template: TemplateWithDetails,
    filters: TemplateFilters
  ): boolean => {
    if (filters.hasVariables && (!template.variables || template.variables.length === 0)) {
      return false;
    }
  
    if (filters.hasCategories && (!template.categories || template.categories.length === 0)) {
      return false;
    }
  
    if (filters.variableTypes.length > 0 && !template.variables?.some(variable => 
      filters.variableTypes.includes(variable.type)
    )) {
      return false;
    }
  
    return true;
  };
  
  export const filterByDate = (
    template: TemplateWithDetails,
    filters: TemplateFilters
  ): boolean => {
    const createdAt = new Date(template.created_at);
  
    if (filters.showRecent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (createdAt < sevenDaysAgo) {
        return false;
      }
    }
  
    if (filters.dateRange.from && createdAt < filters.dateRange.from) {
      return false;
    }
  
    if (filters.dateRange.to && createdAt > filters.dateRange.to) {
      return false;
    }
  
    return true;
  };
  
  export const sortTemplates = (
    templates: TemplateWithDetails[],
    sortBy: TemplateFilters['sortBy'],
    sortDirection: TemplateFilters['sortDirection']
  ): TemplateWithDetails[] => {
    return [...templates].sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc'
          ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
      } else {
        return sortDirection === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };
  
  // Update your existing hasSearchFilters function
  export const hasSearchFilters = (filters: TemplateFilters) => {
    return filters.searchIn.variables || 
           filters.searchIn.categories || 
           filters.searchIn.elements || 
           (!filters.searchIn.name && !filters.searchIn.description);
  };

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};