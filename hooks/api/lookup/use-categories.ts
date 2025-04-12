import { useEffect, useState } from 'react';

export type Module = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  elements?: Element[];
};

export type Element = {
  id: number;
  name: string;
  description?: string;
  material_cost?: string;
  labor_cost?: string;
  module_id: number;
  created_at: string;
  updated_at: string;
};

export const useCategories = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get JWT token from cookies
      const cookies = document.cookie.split(';');
      const authTokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      const token = authTokenCookie ? authTokenCookie.split('=')[1].trim() : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      
      // Fetch modules
      const modulesResponse = await fetch(`${apiUrl}/api/modules/modules`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!modulesResponse.ok) {
        throw new Error(`Error fetching modules: ${modulesResponse.status}`);
      }
      
      const modulesData = await modulesResponse.json();
      
      // For each module, fetch its elements
      const modulesWithElements = await Promise.all(
        modulesData.map(async (module: Module) => {
          try {
            const encodedModuleName = encodeURIComponent(module.name);
            const elementsResponse = await fetch(`${apiUrl}/api/elements/elements?modules=${encodedModuleName}`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
              },
            });
            
            if (!elementsResponse.ok) {
              console.error(`Error fetching elements for module ${module.name}: ${elementsResponse.status}`);
              return { ...module, elements: [] };
            }
            
            const elementsData = await elementsResponse.json();
            return { ...module, elements: elementsData };
          } catch (elemErr) {
            console.error(`Failed to fetch elements for module ${module.name}:`, elemErr);
            return { ...module, elements: [] };
          }
        })
      );
      
      setModules(modulesWithElements);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch modules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return {
    modules,
    isLoading,
    error,
    refetch: fetchModules
  };
};
