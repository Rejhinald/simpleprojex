"use client";

import { createContext, useContext, useState } from 'react';

interface TemplateContextType {
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <TemplateContext.Provider value={{ expandedId, setExpandedId }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplateContext must be used within a TemplateProvider');
  }
  return context;
}