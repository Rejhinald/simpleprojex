import { useEffect, useState } from 'react';

export type Parameter = {
  id: number;
  name: string;
  type: string;
  description?: string;
  category?: string;
};

export const useParameters = () => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParameters = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get JWT token from cookies
      const cookies = document.cookie.split(';');
      const authTokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      const token = authTokenCookie ? authTokenCookie.split('=')[1].trim() : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/parameters/parameters`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching parameters: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched parameters:', data);
      setParameters(data);
    } catch (err) {
      console.error('Failed to fetch parameters:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parameters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  return {
    parameters,
    isLoading,
    error,
    refetch: fetchParameters
  };
};
