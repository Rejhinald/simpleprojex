// Type definitions for the create proposal components
export interface VariableValue {
    id: number;
    name: string;
    type: string;
    value: string | number;
    formula?: string;
    useFormula?: boolean;
  }
  
  export interface CostPreview {
    elementId: number;
    elementName: string;
    categoryName: string;
    materialCost: number;
    laborCost: number;
    laborRate: number;
    markupPercentage: number;
    markupAmount: number;
    totalCost: number;
  }
  
  export interface TemplateItem {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    variables: Array<{
      id: number;
      name: string;
      type: string;
    }>;
    categories: Array<{
      id: number;
      name: string;
      elements: Array<{
        id: number;
        name: string;
        material_cost: string;
        labor_cost: string;
      }>;
    }>;
  }
  
  // LocalStorage keys
  export const STORAGE_KEYS = {
    PROPOSAL_DATA: "proposal_form_data",
    TEMPLATE_ID: "proposal_template_id",
    VARIABLES: "proposal_variables",
    MARKUPS: "proposal_markups",
    LABOR_RATES: "proposal_labor_rates"
  };