'use client'

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
  type: string;
}

interface Element {
  id: number;
  name: string;
  material_cost: number;
  labor_cost: number;
}

interface Category {
  id: number;
  name: string;
  elements?: Element[];
}

interface Variable {
  name: string;
  type: string;
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
  categories: Category[];
  variables: Variable[];
  image: string;
}

interface GetTemplateByIdResult {
  template: Template | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const getTemplateById = (id: number | string): GetTemplateByIdResult => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/templates/templates/${id}`);

      if (!response.ok) {
        throw new Error(`Error fetching template: ${response.statusText}`);
      }

      const data = await response.json();
      setTemplate(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to fetch template:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  return {
    template,
    isLoading,
    error,
    refetch: fetchTemplate,
  };
};