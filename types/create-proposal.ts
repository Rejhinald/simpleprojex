// import { ProposalData } from "./proposals";
import { Module, ProjectElement } from "@/types/proposals";

export interface ProposalData {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  // image: File;
  modules: Module[];
  template_elements: ProjectElement[];
  parameters: ProposalParameters[];
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  useGlobalMarkup: boolean;
  globalMarkupPercentage: number;
}

export interface ProposalParameters {
  id: number;
  name: string;
  type: string;
  value: number;
  formula: string;
  parameter:any;
}
export interface CostCalculationProps {
  proposal: ProposalData;
  onNext: () => void;
  onUpdateProposal?: (proposal: ProposalData) => void;
}

export interface AddParameterProps {
  newParameter: {
    name: string;
    type: string;
    value: string;
  };
  setNewParameter: (parameter: {
    name: string;
    type: string;
    value: string;
  }) => void;
  handleAddParameter: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

export interface ElementDialogProps {
  isElementDialogOpen: boolean;
  setIsElementDialogOpen: (isOpen: boolean) => void;
  newElement: {
    categoryId: number | null;
    name: string;
    material_cost: string;
    labor_cost: string;
  };
  setNewElement: (element: {
    categoryId: number | null;
    name: string;
    material_cost: string;
    labor_cost: string;
  }) => void;
  handleAddElement: () => void;
  editingElement: Element | null;
  variables: any[];
}
