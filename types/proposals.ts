import { SortOption } from "./sort";
import { Contract } from "./contracts";

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
    created_at: Date;
    updated_at: Date;
    image: string;
    formula: string;
    labor_formula: string;
  };
  project_module: {
    id: number;
    module: Module;
    created_at: Date;
    updated_at: Date;
  };
  module: any;
  template_elements: any;
  quantity: number;
  labor_cost: string; // formula string
  markup: string; // percent as string
  total: number;
  material_cost: string; // formula string
}

export interface ProjectParameter {
  id: number;
  parameter: {
    id: number;
    name: string;
    value: number;
    type: string;
  };
  type: string;
  name: string;
  value: number;
  formula: string;
}

export interface ProjectModule {
  id: number;
  module: Module;
  created_at: Date;
  updated_at: Date;
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
  image: string;
  user: User;
  project_elements: ProjectElement[];
  project_parameters: ProjectParameter[];
  project_modules: ProjectModule[];
  contract: Contract;
}

// export interface Template extends Omit<ProposalData, "variables"> {
//   variables: Omit<Variable, "value">[]
//   image: string
// }