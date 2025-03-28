"use client";

import { createContext, useContext, useState } from 'react';

interface ProposalContextType {
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export function ProposalProvider({ children }: { children: React.ReactNode }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <ProposalContext.Provider value={{ expandedId, setExpandedId }}>
      {children}
    </ProposalContext.Provider>
  );
}

export function useProposalContext() {
  const context = useContext(ProposalContext);
  if (context === undefined) {
    throw new Error('useProposalContext must be used within a ProposalProvider');
  }
  return context;
}