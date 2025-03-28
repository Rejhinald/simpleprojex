"use client";

import { useCallback, useState, useRef } from "react";
import { proposalApi, templateApi, PaginatedResponse, Template } from "../../api/apiService";
import { toast } from "sonner";
import { 
  ProposalWithDetails, 
  ProposalFilters, 
  searchInProposal,
  filterByContent,
  filterByDate,
  sortProposals
} from "../utils/proposal-utils";

export function useProposals() {
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailsLoading, setDetailsLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedProposals, setExpandedProposals] = useState<Record<number, boolean>>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(false);
  
  // Keep track of which proposal details we've already tried to load
  const loadedProposalDetailsRef = useRef<Record<number, boolean>>({});

  const loadProposalDetails = async (id: number): Promise<void> => {
    // Skip if already loading or already loaded or if we've already tried and failed
    if (detailsLoading[id] || 
        proposals.find(p => p.id === id)?.variableValues || 
        loadedProposalDetailsRef.current[id]) {
      return;
    }

    try {
      setDetailsLoading(prev => ({ ...prev, [id]: true }));
      
      // Fetch variable values and element values
      const [variableValues, elementValues] = await Promise.all([
        proposalApi.getVariableValues(id).catch(err => {
          console.warn(`No variable values for proposal ${id}:`, err);
          return []; // Return empty array on 404 or other errors
        }),
        proposalApi.getElementValues(id).catch(err => {
          console.warn(`No element values for proposal ${id}:`, err);
          return []; // Return empty array on 404 or other errors
        })
      ]);

      // Update proposal with details
      const updateProposalWithDetails = (proposal: ProposalWithDetails) =>
        proposal.id === id ? { ...proposal, variableValues, elementValues } : proposal;

      setProposals(prev => prev.map(updateProposalWithDetails));
      setFilteredProposals(prev => prev.map(updateProposalWithDetails));
      
      // Mark as loaded so we don't try again
      loadedProposalDetailsRef.current[id] = true;
    } catch (err) {
      // Only show toast for errors other than 404
      if (!(err instanceof Error && err.message.includes("Not Found"))) {
        toast.error(`Failed to load proposal details: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
      loadedProposalDetailsRef.current[id] = true; // Mark as attempted
    } finally {
      setDetailsLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const loadProposals = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data: PaginatedResponse<ProposalWithDetails> = await proposalApi.list();
      const proposals = data.items || [];
      
      // Reset loaded details tracking
      loadedProposalDetailsRef.current = {};
      
      // Load templates for each proposal that has a template_id
      const templateIds = [...new Set(proposals.filter(p => p.template_id).map(p => p.template_id as number))];
      
      if (templateIds.length > 0) {
        setTemplatesLoading(true);
        try {
          const templatesData = await templateApi.list();
          setTemplates(templatesData.items || []);
          
          // Attach template data to each proposal
          const proposalsWithTemplates = proposals.map(proposal => {
            if (proposal.template_id) {
              const template = templatesData.items.find(t => t.id === proposal.template_id);
              return { ...proposal, template };
            }
            return proposal;
          });
          
          setProposals(proposalsWithTemplates);
          setFilteredProposals(proposalsWithTemplates);
        } catch (error) {
          console.error("Failed to load templates:", error);
        } finally {
          setTemplatesLoading(false);
        }
      } else {
        setProposals(proposals);
        setFilteredProposals(proposals);
      }
      
      setError(null);

      // Don't immediately load all details - load them as needed
      // We'll load them when individual cards are viewed
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProposal = async (id: number): Promise<boolean> => {
    try {
      await proposalApi.delete(id);
      await loadProposals();
      toast.success("Proposal deleted successfully");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Failed to delete proposal");
      return false;
    }
  };

  const toggleProposalExpand = useCallback((id: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    // Load details if expanding and not already loaded
    setExpandedProposals(prev => {
      const isCurrentlyExpanded = prev[id];
      if (!isCurrentlyExpanded) {
        // If we're expanding, load the details if not already loaded
        loadProposalDetails(id);
      }
      return {
        ...prev,
        [id]: !isCurrentlyExpanded
      };
    });
  }, []);

  const filterProposals = useCallback((query: string, filters: ProposalFilters) => {
    if (!proposals) return;

    let result = proposals.filter(proposal => {
      // Basic search in name
      if (!query) return true;
      
      return searchInProposal(proposal, query, filters.searchIn);
    });
    
    // Apply content filters
    result = result.filter(proposal => filterByContent(proposal, filters));
    
    // Apply date filters
    result = result.filter(proposal => filterByDate(proposal, filters));
    
    // Apply sorting
    result = sortProposals(result, filters.sortBy, filters.sortDirection);
    
    setFilteredProposals(result);
  }, [proposals]);

  return {
    proposals,
    filteredProposals,
    loading,
    error,
    detailsLoading,
    expandedProposals,
    templates,
    templatesLoading,
    loadProposals,
    deleteProposal,
    toggleProposalExpand,
    filterProposals,
  };
}