"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { contractApi, Contract, PaginatedResponse } from "../api/apiService";
import { Separator } from "@/components/ui/separator";
import { ContractsList } from "./components/ContractsList";
import { ContractListSkeleton } from "./components/ContractListSkeleton";
import { EmptyContracts } from "./components/EmptyContracts";
import { ContractHeader } from "./components/ContractHeader";
import { ContractProvider } from "./contexts/ContractContext";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ContractsPage() {
  return (
    <ContractProvider>
      <ContractsContent />
    </ContractProvider>
  );
}

function ContractsContent() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // Load contracts with proper error handling
  const loadContracts = async () => {
    setLoading(true);
    try {
      // Call the API to fetch contracts data
      const response: PaginatedResponse<Contract> = await contractApi.list();
      console.log(`Fetched ${response.count} contracts`);
      
      // Update local state
      setContracts(response.items || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error(`Failed to load contracts: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    void loadContracts();
  }, []);
  
  // Use motion to animate the page content
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col flex-1"
    >
      <ContractHeader />
      
      <Separator className="mb-8 w-full" />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="w-full flex-1 pb-8">
        {loading ? (
          <ContractListSkeleton />
        ) : (
          <>
            {contracts.length === 0 ? (
              <EmptyContracts />
            ) : (
              <ContractsList contracts={contracts} onRefresh={loadContracts} />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}