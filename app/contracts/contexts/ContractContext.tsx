"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { contractApi, Contract, PaginatedResponse, SignContractRequest } from "../../api/apiService";
import { toast } from "sonner";

interface ContractContextType {
  contracts: Contract[];
  loadContracts: () => Promise<void>;
  signContract: (contractId: number, type: 'client' | 'contractor', initials: string, signature?: File | null) => Promise<boolean>;
  uploadSignature: (contractId: number, type: 'client' | 'contractor', initials: string, file: File) => Promise<boolean>;
  deleteContract: (contractId: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadContracts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data: PaginatedResponse<Contract> = await contractApi.list();
      setContracts(data.items || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to load contracts: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const signContract = useCallback(async (
    contractId: number, 
    type: 'client' | 'contractor', 
    initials: string,
    signature?: File | null
  ): Promise<boolean> => {
    try {
      // Handle signature file upload if provided
      if (signature) {
        // Use the appropriate API method based on the signer type
        if (type === 'client') {
          await contractApi.uploadClientSignature(contractId, signature, initials);
        } else {
          await contractApi.uploadContractorSignature(contractId, signature, initials);
        }
      } else {
        // If no signature file, just use initials
        const data: SignContractRequest = { initials };
        
        if (type === 'client') {
          await contractApi.clientSign(contractId, data);
        } else {
          await contractApi.contractorSign(contractId, data);
        }
      }
      
      await loadContracts();
      
      toast.success(`Contract successfully signed by ${type}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Failed to sign contract: ${errorMessage}`);
      return false;
    }
  }, [loadContracts]);
  
  const uploadSignature = useCallback(async (
    contractId: number,
    type: 'client' | 'contractor',
    initials: string,
    file: File
  ): Promise<boolean> => {
    try {
      let updatedContract;
      
      if (type === 'client') {
        updatedContract = await contractApi.uploadClientSignature(contractId, file, initials);
      } else {
        updatedContract = await contractApi.uploadContractorSignature(contractId, file, initials);
      }
      
      // Update the contract in the local state
      setContracts(prevContracts => 
        prevContracts.map(c => 
          c.id === updatedContract.id ? updatedContract : c
        )
      );
      
      return true;
    } catch (error) {
      console.error(`Error uploading ${type} signature:`, error);
      return false;
    }
  }, []);
  
  const deleteContract = useCallback(async (contractId: number): Promise<boolean> => {
    try {
      // Call the API to delete the contract
      await contractApi.delete(contractId);
      
      // Update local state immediately for a snappy UI
      setContracts(prev => prev.filter(contract => contract.id !== contractId));
      
      toast.success("Contract deleted successfully");
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Failed to delete contract: ${errorMessage}`);
      return false;
    }
  }, []);
  
  return (
    <ContractContext.Provider 
      value={{ 
        contracts, 
        loadContracts, 
        signContract,
        uploadSignature,
        deleteContract,
        loading,
        error
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

export function useContractContext() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContractContext must be used within a ContractProvider');
  }
  return context;
}