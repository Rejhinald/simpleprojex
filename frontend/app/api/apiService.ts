// Define types based on your Django models
export interface Template {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Category {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements: any;
  id: number;
  name: string;
  template_id: number;
  position: number;
}

export interface Variable {
  id: number;
  name: string;
  type: 'LINEAR_FEET' | 'SQUARE_FEET' | 'CUBIC_FEET' | 'COUNT';
  template_id: number;
}

export interface Element {
  id: number;
  name: string;
  category_id: number;
  material_cost: string;
  labor_cost: string;
  markup_percentage: number;
  position: number;
}

export interface Proposal {
  id: number;
  name: string;
  template_id: number | null;
  created_at: string;
  global_markup_percentage: string;
}

export interface VariableValue {
  variable_id: number;
  variable_name?: string;
  variable_type?: string;
  value: number;
}

export interface ElementValue {
  element_id: number;
  element_name?: string;
  category_id?: number;
  category_name?: string;
  calculated_material_cost: string;
  calculated_labor_cost: string;
  markup_percentage: string;
  total_cost?: number;
  total_with_markup?: number;
}

export interface Contract {
  id: number;
  proposal_id: number;
  client_name: string;
  client_initials: string;
  client_signature?: string | null;
  contractor_name: string;
  contractor_initials: string;
  contractor_signature?: string | null;
  created_at: string;
  client_signed_at: string | null;
  contractor_signed_at: string | null;
  terms_and_conditions: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
}

// Request interfaces
export interface CreateTemplateRequest {
  name: string;
  description: string;
}

export interface CreateCategoryRequest {
  name: string;
  position: number;
}

export interface CreateVariableRequest {
  name: string;
  type: 'LINEAR_FEET' | 'SQUARE_FEET' | 'CUBIC_FEET' | 'COUNT';
}

export interface CreateElementRequest {
  name: string;
  material_cost: string;
  labor_cost: string;
  markup_percentage: number;
  position: number;
}

export interface CreateProposalFromTemplateRequest {
  name: string;
  template_id: number;
  global_markup_percentage: number;
}

export interface CreateProposalFromScratchRequest {
  name: string;
  global_markup_percentage: number;
}

export interface SetVariableValueRequest {
  variable_id: number;
  value: number;
}

export interface UpdateElementValueRequest {
  element_id: number;
  calculated_material_cost: number;
  calculated_labor_cost: number;
  markup_percentage: number;
}

export interface GenerateContractRequest {
  client_name: string;
  client_initials: string;
  contractor_name: string;
  contractor_initials: string;
  terms_and_conditions: string;
}

export interface SignContractRequest {
  initials: string;
}

// API Service for interacting with the backend
const API_BASE_URL = 'http://localhost:8000/api';

// Generic API methods
async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function postData<T, R>(endpoint: string, data: T): Promise<R> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json() as Promise<R>;
}

async function putData<T, R>(endpoint: string, data: T): Promise<R> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json() as Promise<R>;
}

async function deleteData<R>(endpoint: string): Promise<R> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json() as Promise<R>;
}

// Template API methods
export const templateApi = {
  list: () => fetchData<PaginatedResponse<Template>>('/templates'),
  getById: (id: number) => fetchData<Template>(`/templates/${id}`),
  create: (data: CreateTemplateRequest) => postData<CreateTemplateRequest, Template>('/templates', data),
  update: (id: number, data: Partial<CreateTemplateRequest>) => putData<Partial<CreateTemplateRequest>, Template>(`/templates/${id}`, data),
  delete: (id: number) => deleteData<unknown>(`/templates/${id}`),
  listCategories: (templateId: number) => fetchData<Category[]>(`/templates/${templateId}/categories`),
  createCategory: (templateId: number, data: CreateCategoryRequest) => 
    postData<CreateCategoryRequest, Category>(`/templates/${templateId}/categories`, data),
  listVariables: (templateId: number) => fetchData<Variable[]>(`/templates/${templateId}/variables`),
  createVariable: (templateId: number, data: CreateVariableRequest) => 
    postData<CreateVariableRequest, Variable>(`/templates/${templateId}/variables`, data),
};

// Category API methods
export const categoryApi = {
  listElements: (categoryId: number) => fetchData<Element[]>(`/categories/${categoryId}/elements`),
  createElement: (categoryId: number, data: CreateElementRequest) => 
    postData<CreateElementRequest, Element>(`/categories/${categoryId}/elements`, data),
  update: (id: number, data: Partial<CreateCategoryRequest>) => 
    putData<Partial<CreateCategoryRequest>, Category>(`/categories/${id}`, data),
  delete: (id: number) => deleteData<unknown>(`/categories/${id}`)
  // Remove the listCategories method since we don't need it
};

// Element API methods
export const elementApi = {
  update: (id: number, data: Partial<CreateElementRequest>) => 
    putData<Partial<CreateElementRequest>, Element>(`/elements/${id}`, data),
  delete: (id: number) => deleteData<unknown>(`/elements/${id}`),
};

// Proposal API methods
export const proposalApi = {
  list: () => fetchData<PaginatedResponse<Proposal>>('/proposals'),
  getById: (id: number) => fetchData<Proposal>(`/proposals/${id}`),
  createFromTemplate: (data: CreateProposalFromTemplateRequest) => 
    postData<CreateProposalFromTemplateRequest, Proposal>('/proposals/from-template', data),
  createFromScratch: (data: CreateProposalFromScratchRequest) => 
    postData<CreateProposalFromScratchRequest, Proposal>('/proposals/from-scratch', data),
  update: (id: number, data: Partial<CreateProposalFromScratchRequest>) => 
    putData<Partial<CreateProposalFromScratchRequest>, Proposal>(`/proposals/${id}`, data),
  delete: (id: number) => deleteData<unknown>(`/proposals/${id}`),
  getVariableValues: (proposalId: number) => 
    fetchData<VariableValue[]>(`/proposals/${proposalId}/variable-values`),
  setVariableValues: (proposalId: number, data: SetVariableValueRequest[]) => 
    postData<SetVariableValueRequest[], VariableValue[]>(`/proposals/${proposalId}/variable-values`, data),
  getElementValues: (proposalId: number) => 
    fetchData<ElementValue[]>(`/proposals/${proposalId}/element-values`),
  updateElementValues: (proposalId: number, data: UpdateElementValueRequest[]) => 
    postData<UpdateElementValueRequest[], ElementValue[]>(`/proposals/${proposalId}/element-values`, data),
  generateContract: (proposalId: number, data: GenerateContractRequest) => 
    postData<GenerateContractRequest, Contract>(`/proposals/${proposalId}/generate-contract`, data),
};

// Contract API methods
export const contractApi = {
  list: () => fetchData<PaginatedResponse<Contract>>('/contracts'),
  getById: (id: number) => fetchData<Contract>(`/contracts/${id}`),
  clientSign: (id: number, data: SignContractRequest) => 
    putData<SignContractRequest, Contract>(`/contracts/${id}/client-sign`, data),
  contractorSign: (id: number, data: SignContractRequest) => 
    putData<SignContractRequest, Contract>(`/contracts/${id}/contractor-sign`, data),
};