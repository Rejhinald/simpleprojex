"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useProposals } from "./hooks/useProposals";
import { ProposalFilters, defaultFilters } from "./utils/proposal-utils";
import { CreateProposalDialog } from "./components/CreateProposalDialog";
import { ProposalFiltersBar } from "./components/ProposalFilters";
import { ProposalList } from "./components/ProposalList";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";
import { ProposalSkeletons } from "./components/LoadingSkeletons";
import { ProposalProvider } from "./contexts/ProposalContext";
import { Loader2 } from "lucide-react";

export default function ProposalsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<ProposalFilters>(defaultFilters);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [proposalToDelete, setProposalToDelete] = useState<number | null>(null);
  
  const { 
    filteredProposals,
    loading,
    error,
    detailsLoading,
    loadProposals,
    deleteProposal,
    filterProposals
  } = useProposals();

  // Load proposals only once on mount
  useEffect(() => {
    loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Filter proposals when search or filters change
  useEffect(() => {
    filterProposals(searchQuery, filters);
  }, [searchQuery, filters, filterProposals]);
  
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  const handleFiltersChange = useCallback((newFilters: ProposalFilters) => {
    setFilters(newFilters);
  }, []);
  
  const handleDeleteClick = useCallback((id: number) => {
    setProposalToDelete(id);
    setDeleteDialogOpen(true);
  }, []);
  
  const confirmDelete = useCallback(async () => {
    if (proposalToDelete === null) return;
    
    const success = await deleteProposal(proposalToDelete);
    if (success) {
      setDeleteDialogOpen(false);
      setProposalToDelete(null);
    }
  }, [proposalToDelete, deleteProposal]);
  
  const handleGenerateContract = useCallback(() => {
    // The contract dialog now handles its own state, 
    // so we don't need to set any state here
  }, []);
  
  const hasActiveFilters = useCallback(() => {
    return filters.showRecent || 
           filters.hasTemplate || 
           Object.values(filters.searchIn).some(value => value !== defaultFilters.searchIn.name);
  }, [filters]);
  
  
  return (
    <ProposalProvider>
      <div className="w-full h-full flex flex-col flex-1">
        {/* Show loader when loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading proposals...</p>
          </div>
        )}
        
        {/* Header with title and create button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-4 gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold tracking-tight"
            >
              Proposals
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 } }}
              className="text-muted-foreground mt-1"
            >
              Create and manage client proposals
            </motion.p>
          </div>

          <CreateProposalDialog onProposalCreated={loadProposals} />
        </div>


        
        {/* Search and filter area */}
        <ProposalFiltersBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        
        <Separator className="mb-8 w-full" />
        
        {/* Content section */}
        <div className="w-full flex-1 pb-8">
          {loading ? (
            <ProposalSkeletons />
          ) : (
            <ProposalList
              proposals={filteredProposals}
              error={error}
              detailsLoading={detailsLoading}
              onRetry={loadProposals}
              onDelete={handleDeleteClick}
              onGenerateContract={handleGenerateContract}
              onCreateNew={() => {
                document.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')?.click();
              }}
              searchQuery={searchQuery}
              hasFilters={hasActiveFilters()}
            />
          )}
        </div>
        
        {/* Dialogs */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
        />
      </div>
    </ProposalProvider>
  );
}