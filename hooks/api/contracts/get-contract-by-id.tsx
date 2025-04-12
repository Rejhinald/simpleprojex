import { useCallback, useState } from 'react';

export interface ContractModule {
  id: number;
  module: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ContractElement {
  id: number;
  element: {
    id: number;
    name: string;
    description: string;
    module: {
      id: number;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
    created_at: string;
    updated_at: string;
    image: string;
  };
  contract_module: {
    id: number;
    module: {
      id: number;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
  };
  formula: string;
  labor_formula: string;
  image: string;
}

export interface Contract {
  uuid: string;
  contractName: string;
  contractDescription: string;
  contractDate: string;
  termsAndConditions: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  clientAddress: string;
  clientInitials: string;
  clientImage: string;
  contractorName: string;
  contractorAddress: string;
  contractorInitials: string;
  contractorImage: string;
  contractElements: ContractElement[];
  contractModules: ContractModule[];
}

interface getContractReturn {
  contract: Contract | null;
  isLoading: boolean;
  error: Error | null;
  fetchContract: (contractId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const getContractById = (initialContractId?: string): getContractReturn => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [contractId, setContractId] = useState<string | undefined>(initialContractId);

  const fetchContract = useCallback(async (id?: string) => {
    if (id) {
      setContractId(id);
    }
    
    const targetId = id || contractId;
    
    if (!targetId) {
      setError(new Error('Contract ID is required'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get authorization token from cookies
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      const token = authCookie ? authCookie.split('=')[1].trim() : null;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/contracts/contract/${targetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contract: ${response.status} ${response.statusText}`);
      }

      let data: Contract;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }
      setContract(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  const refetch = useCallback(() => {
    return fetchContract();
  }, [fetchContract]);

  return {
    contract,
    isLoading,
    error,
    fetchContract,
    refetch
  };
};

export default getContractById;