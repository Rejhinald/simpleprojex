import { SortOption } from "./sort";

export interface ProposalsGridProps {
  sortOption: SortOption;
  searchQuery?: string;
}

export interface ProposalsPageProps {
  params: {
    id: number;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Module {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectElement {
  id: number;
  element: {
    id: number;
    name: string;
    description: string;
    module: Module;
    created_at: Date;
    updated_at: Date;
    image: string;
  };
  project_module: {
    id: number;
    module: Module;
    created_at: Date;
    updated_at: Date;
  };
  formula: string;
  labor_formula: string;
  quantity: number;
  labor_cost: number;
  markup: number;
  total: number;
  material_cost: number;
}

export interface ProjectParameter {
  id: number;
  parameter: {
    id: number;
    name: string;
    value: number;
    type: string;
  };
  value: number;
  formula: string;
}

export interface ProjectModule {
  id: number;
  module: Module;
  created_at: Date;
  updated_at: Date;
}

export interface ContractElement {
  id: number;
  element: {
    id: number;
    name: string;
    description: string;
    module: Module;
    created_at: Date;
    updated_at: Date;
    image: string;
  };
  contract_module: {
    id: number;
    module: Module;
  };
  formula: string;
  labor_formula: string;
  image: string;
}

export interface ContractModule {
  id: number;
  module: Module;
}

export interface Contract {
  uuid: string;
  contractName: string;
  contractDescription: string;
  contractDate: string;
  termsAndConditions: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  clientAddress: string;
  clientInitials: string;
  clientImage: string;
  contractorName: string;
  contractorAddress: string;
  contractorInitials: string;
  contractorImage: string;
  contractElements: ContractElement[];
  contractModules: ContractModule[];
}

export interface Proposal {
  id: number;
  name: string;
  client_name: string;
  client_email: string;
  phone_number: string;
  address: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: User;
  image: string;
  project_elements: ProjectElement[];
  project_parameters: ProjectParameter[];
  project_modules: ProjectModule[];
  contract: Contract;
}

// Legacy types below - keeping for backward compatibility with existing components
export interface ProposalData {
  id: number
  title: string
  description: string
  modules: Category[]
  variables: Variable[]
  created_at: string
  image: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  useGlobalMarkup?: boolean
  globalMarkupPercentage?: number
  imageUrl?: string
  parameters: Variable[]
  template_elements: ProposalElement[]
}

export interface Variable {
  id: number
  name: string
  type: string
  value?: string
}

export interface Element {
  id: number
  name: string
  material_cost: string
  labor_cost: string
  markup_percentage: number
  calculatedMaterialCost?: number
  calculatedLaborCost?: number
}

export interface Category {
  id: number
  name: string
  elements: ProposalElement[];
}

export type ProposalElement = {
  id: number;
  name: string;
  material_cost: string;
  labor_cost: string;
  markup_percentage: number;
};

export interface Template extends Omit<ProposalData, "variables"> {
  variables: Omit<Variable, "value">[]
  image: string
}