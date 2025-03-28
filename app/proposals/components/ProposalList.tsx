"use client";

import { motion } from "framer-motion";
import { X, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "./ProposalCard";
import { ProposalWithDetails } from "../utils/proposal-utils";
import { useProposalContext } from "../contexts/ProposalContext";

interface ProposalListProps {
  proposals: ProposalWithDetails[];
  error: string | null;
  detailsLoading: Record<number, boolean>;
  onRetry: () => void;
  onDelete: (id: number) => void;
  onGenerateContract?: (id: number) => void;
  searchQuery: string;
  hasFilters: boolean;
  onCreateNew: () => void;
}

export function ProposalList({
  proposals,
  error,
  detailsLoading,
  onRetry,
  onDelete,
  onCreateNew,
  onGenerateContract,
  searchQuery,
  hasFilters,
}: ProposalListProps) {
  const { } = useProposalContext();
  
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

  if (proposals.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-4 w-full"
      >
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No proposals found</h3>
        {searchQuery || hasFilters ? (
          <p className="text-muted-foreground">
            No proposals match your search criteria or filters
          </p>
        ) : (
          <p className="text-muted-foreground">
            Get started by creating your first proposal
          </p>
        )}
        <Button 
          className="mt-2 bg-green-600 hover:bg-green-700"
          onClick={onCreateNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Proposal
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
      {proposals.map(proposal => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          isLoading={detailsLoading[proposal.id] || false}
          onDelete={onDelete}
          onGenerateContract={onGenerateContract}
        />
      ))}
    </motion.div>
  );
}