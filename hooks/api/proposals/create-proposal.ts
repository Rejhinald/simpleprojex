import { useState } from "react";
import { ProposalData } from "@/types/proposals";
import Cookies from "js-cookie";

interface CreateProposalResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export const useCreateProposal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProposal = async (proposalData: ProposalData): Promise<CreateProposalResponse> => {
    setIsLoading(true);
    setError(null);
    
    const token = Cookies.get("auth-token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/projects/project/new/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(proposalData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create proposal');
      }
      
      setIsLoading(false);
      return {
        success: true,
        id: data.id,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    createProposal,
    isLoading,
    error,
  };
};