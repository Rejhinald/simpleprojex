import { useState } from 'react';
import { Contract } from '../contracts/get-contract-by-id';

interface PostContractResponse {
  success: boolean;
  message: string;
  contract?: Contract;
}

interface PostContractReturn {
  postContract: (contractData: any) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: PostContractResponse | null;
}

export default function usePostContractDetails(): PostContractReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PostContractResponse | null>(null);

  const postContract = async (contractData: any): Promise<void> => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    
    try {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      const token = authCookie ? authCookie.split('=')[1].trim() : null;

      if (!token) {
        throw new Error('Authentication token not found');
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/contracts/contracts/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contractData)
      });

      let responseData;
      try {
        const text = await response.text(); // Get response as text first
        responseData = text ? JSON.parse(text) : {}; // Parse if not empty
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create contract');
      }
      
      setData(responseData);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    postContract,
    isLoading,
    isSuccess,
    error,
    data
  };
}
