import { useState, useEffect } from 'react';
import { Proposal } from '@/types/proposals';

interface GetProposalsResult {
  proposals: Proposal[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const getProposals = (): GetProposalsResult => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProposals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/projects/project`);
      
      if (!response.ok) {
        throw new Error(`Error fetching proposals: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProposals(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Failed to fetch proposals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    isLoading,
    error,
    refetch: fetchProposals
  };
};