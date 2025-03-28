"use client";

import { Proposal, Template, Variable, VariableValue, ElementValue, Category } from "../../api/apiService";

export interface ProposalWithDetails extends Proposal {
  template?: Template;
  variableValues?: VariableValue[];
  elementValues?: ElementValue[];
  categories?: Category[];
  variables?: Variable[];
  description?: string;
}

export interface ProposalFilters {
  sortBy: 'name' | 'created_at';
  sortDirection: 'asc' | 'desc';
  showRecent: boolean;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  hasTemplate: boolean;
  searchIn: {
    name: boolean;
    templatesUsed: boolean;
  };
}

export const defaultFilters: ProposalFilters = {
  sortBy: 'created_at',
  sortDirection: 'desc',
  showRecent: false,
  dateRange: { from: null, to: null },
  hasTemplate: false,
  searchIn: {
    name: true,
    templatesUsed: false,
  }
};

export const calculateTotalProposalCost = (elementValues: ElementValue[]): number => {
  return elementValues.reduce((total, element) => {
    const materialCost = parseFloat(element.calculated_material_cost) || 0;
    const laborCost = parseFloat(element.calculated_labor_cost) || 0;
    const markup = parseFloat(element.markup_percentage) / 100;
    
    const subtotal = materialCost + laborCost;
    return total + (subtotal + (subtotal * markup));
  }, 0);
};

export const searchInProposal = (
  proposal: ProposalWithDetails,
  query: string,
  searchIn: ProposalFilters['searchIn']
): boolean => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return true;

  // Check proposal name
  if (searchIn.name && proposal.name.toLowerCase().includes(searchTerm)) {
    return true;
  }

  // Check template name if available
  if (searchIn.templatesUsed && proposal.template && 
      proposal.template.name.toLowerCase().includes(searchTerm)) {
    return true;
  }

  return false;
};

export const filterByContent = (
  proposal: ProposalWithDetails,
  filters: ProposalFilters
): boolean => {
  if (filters.hasTemplate && !proposal.template_id) {
    return false;
  }

  return true;
};

export const filterByDate = (
  proposal: ProposalWithDetails,
  filters: ProposalFilters
): boolean => {
  const createdAt = new Date(proposal.created_at);

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

export const sortProposals = (
  proposals: ProposalWithDetails[],
  sortBy: ProposalFilters['sortBy'],
  sortDirection: ProposalFilters['sortDirection']
): ProposalWithDetails[] => {
  return [...proposals].sort((a, b) => {
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

export const hasAdvancedSearch = (filters: ProposalFilters) => {
  return filters.searchIn.templatesUsed || !filters.searchIn.name;
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

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};