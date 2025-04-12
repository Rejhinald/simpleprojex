'use client'

import { useState, useEffect } from "react";

export interface TemplateElement {
  id: number;
  template_id: number;
  element_id: number;
  name: string;
  module: string;
  formula: string;
  labor_formula: string;
  material_cost: number;
  labor_cost: number;
  category_id?: number;
  category_name?: string;
  description?: string;
  image?: string;
  selected: boolean;
  
}

interface GetTemplateElementsResult {
  elements: TemplateElement[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const getTemplateElements = (templateId: number | string): GetTemplateElementsResult => {
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchElements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/templates/template-elements?template_id=${templateId}`);

      if (!response.ok) {
        throw new Error(`Error fetching template elements: ${response.statusText}`);
      }

      const data = await response.json();
      setElements(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to fetch template elements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (templateId) {
      fetchElements();
    }
  }, [templateId]);

  return {
    elements,
    isLoading,
    error,
    refetch: fetchElements,
  };
};