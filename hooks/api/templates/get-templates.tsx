import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  username: string;
}

interface Module {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Parameter {
  id: number;
  name: string;
  value: number;
  category: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: User;
  modules: Module[];
  parameters: Parameter[];
  image: string;
}

interface GetTemplatesResult {
  templates: Template[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const getTemplates = (): GetTemplatesResult => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/templates/templates`);

      if (!response.ok) {
        throw new Error(`Error fetching templates: ${response.statusText}`);
      }

      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to fetch templates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    refetch: fetchTemplates,
  };
};