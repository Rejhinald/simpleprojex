import { Module } from './proposals';

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