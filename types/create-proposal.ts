import { ProposalData } from "./proposals";

export interface CostCalculationProps {
  proposal: ProposalData;
  onNext: () => void;
  onUpdateProposal?: (proposal: ProposalData) => void;
}

export interface AddVariableProps {
    newVariable: {
      name: string;
      type: string;
      value: string;
    };
    setNewVariable: (variable: { name: string; type: string; value: string; }) => void;
    handleAddVariable: () => void;
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