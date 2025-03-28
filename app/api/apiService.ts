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
  default_value: number; // This is what the backend uses
  template_id: number;
  // For backward compatibility with existing code
  variable_value?: number; 
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
  position?: number;
  category_position?: number;
}

export interface Contract {
  id: number;
  proposal_id: number;
  client_name: string;
  client_initials: string;
  client_signature?: string | null; // This will be the URL path to the signature image
  contractor_name: string;
  contractor_initials: string;
  contractor_signature?: string | null; // This will be the URL path to the signature image
  created_at: string;
  client_signed_at: string | null;
  contractor_signed_at: string | null;
  terms_and_conditions: string;
  version: number;  // Add missing field
  is_active: boolean;  // Add missing field
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
  default_value?: number; // Added default_value field
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
  variable_name?: string;
  variable_type?: string;
  value: number;
}

// Updated to include position fields
export interface UpdateElementValueRequest {
  element_id: number;
  element_name?: string;  // Make optional
  category_name?: string; // Make optional
  calculated_material_cost: number;
  calculated_labor_cost: number;
  markup_percentage: number;
  position?: number;      // Make optional
  category_position?: number; // Make optional
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
const API_BASE_URL = 'http://https://rejhinald.pythonanywhere.com/api';

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

// Add this helper function for FormData file uploads
async function uploadFile<R>(endpoint: string, formData: FormData): Promise<R> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    // No Content-Type header is needed as the browser will set it with the correct boundary for FormData
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json() as Promise<R>;
}

// Add a helper function to construct a full URL for signature images
export function getSignatureImageUrl(signaturePath: string | null): string {
  if (!signaturePath) return '';
  
  // If it's already a full URL, return it
  if (signaturePath.startsWith('http')) {
    return signaturePath;
  }
  
  // Remove any existing media prefix to avoid duplication
  const cleanPath = signaturePath.replace(/^media\//, '');
  
  // Add the media prefix only once
  return `https://rejhinald.pythonanywhere.com/${cleanPath}`;
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
    postData<CreateVariableRequest, Variable>(
      `/templates/${templateId}/variables`, 
      {
        name: data.name,
        type: data.type,
        default_value: data.default_value // Make sure this is included
      }
    ),
  updateVariable: (id: number, data: Partial<CreateVariableRequest>) => 
    putData<Partial<CreateVariableRequest>, Variable>(`/variables/${id}`, data),
  deleteVariable: (id: number) => deleteData<unknown>(`/variables/${id}`),
};

// Category API methods - updated to work correctly
export const categoryApi = {
  // Keep existing methods
  listElements: (categoryId: number) => fetchData<Element[]>(`/categories/${categoryId}/elements`),
  createElement: (categoryId: number, data: CreateElementRequest) => 
    postData<CreateElementRequest, Element>(`/categories/${categoryId}/elements`, data),
  update: (id: number, data: Partial<CreateCategoryRequest>) => 
    putData<Partial<CreateCategoryRequest>, Category>(`/categories/${id}`, data),
  delete: (id: number) => deleteData<unknown>(`/categories/${id}`),
  updateElement: (id: number, data: Partial<CreateElementRequest>) => 
    putData<Partial<CreateElementRequest>, Element>(`/elements/${id}`, data),
  deleteElement: (id: number) => deleteData<unknown>(`/elements/${id}`),
  
  // Use the correct direct endpoint for creating categories
  createForProposal: (proposalId: number, data: CreateCategoryRequest) => 
    postData<CreateCategoryRequest, Category>(`/proposals/${proposalId}/categories`, data),
  
  // Create a dummy element to ensure the category shows up
  ensureCategoryVisibility: async (proposalId: number, categoryName: string, position: number) => {
    // Create a placeholder element for this category to make it visible
    return postData<UpdateElementValueRequest[], ElementValue[]>(
      `/proposals/${proposalId}/element-values`, 
      [{
        element_id: -1, // Signals a new element
        element_name: "__category_placeholder__", // Special name we'll filter out in the UI
        category_name: categoryName,
        calculated_material_cost: 0,
        calculated_labor_cost: 0,
        markup_percentage: 0,
        position: 0,
        category_position: position
      }]
    );
  },

  // Get categories both directly and from elements to make sure we get all of them
  getFromProposal: async (proposalId: number): Promise<Category[]> => {
    try {
      // First get elements with their categories
      const elements = await fetchData<ElementValue[]>(`/proposals/${proposalId}/element-values`);
      
      // Build category map with element data
      const categoriesMap: Record<string, Category> = {};
      
      elements.forEach(el => {
        if (el.category_name) {
          const categoryKey = el.category_name;
          
          if (!categoriesMap[categoryKey]) {
            categoriesMap[categoryKey] = {
              id: el.category_id || -1,
              name: el.category_name,
              position: el.category_position || 0,
              elements: [],
              template_id: 0
            };
          }
          
          // Add this element to the category
          categoriesMap[categoryKey].elements = categoriesMap[categoryKey].elements || [];
          categoriesMap[categoryKey].elements.push(el);
        }
      });
      
      // Convert map to array and sort by position
      return Object.values(categoriesMap).sort((a, b) => a.position - b.position);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }
};

// Element API methods - update these methods
export const elementApi = {
  // Keep existing methods
  update: (id: number, data: Partial<CreateElementRequest>) => 
    putData<Partial<CreateElementRequest>, Element>(`/elements/${id}`, data),
  delete: (id: number) => deleteData<unknown>(`/elements/${id}`),
  
  // REPLACE the non-existent createElement method:
// In elementApi.createElement:
createElement: async (proposalId: number, data: {
  element_name: string;
  category_name?: string;
  material_cost: string;
  labor_cost: string;
  markup_percentage: number;
  position: number;
}) => {
  return postData<UpdateElementValueRequest[], ElementValue[]>(
    `/proposals/${proposalId}/element-values`, 
    [{
      element_id: -1,
      element_name: data.element_name,
      category_name: data.category_name,
      calculated_material_cost: 0,
      calculated_labor_cost: 0,
      markup_percentage: data.markup_percentage,
      position: data.position  // Include position
    }]
  ).then(result => result[0]);
}
};

// Variable API methods
export const variableApi = {
  update: (id: number, data: Partial<CreateVariableRequest>) => 
    putData<Partial<CreateVariableRequest>, Variable>(`/variables/${id}`, data),
  delete: (id: number) => deleteData<unknown>(`/variables/${id}`),
  
  // Comprehensive method to update both the variable properties and its value
  updateVariableWithValue: async (proposalId: number, variableId: number, data: {
    name: string;
    type: string;
    value: number;
  }): Promise<void> => {
    // First update the variable properties
    await putData<Partial<CreateVariableRequest>, Variable>(`/variables/${variableId}`, {
      name: data.name,
      type: data.type as 'LINEAR_FEET' | 'SQUARE_FEET' | 'CUBIC_FEET' | 'COUNT',
      default_value: data.value
    });
    
    // Then update the variable value in the proposal
    await postData<SetVariableValueRequest[], VariableValue[]>(`/proposals/${proposalId}/variable-values`, [{
      variable_id: variableId,
      value: data.value
    }]);
  },
  
  // Method to create a new variable in a proposal
  createVariableInProposal: (proposalId: number, data: {
    name: string;
    type: 'LINEAR_FEET' | 'SQUARE_FEET' | 'CUBIC_FEET' | 'COUNT';
    value: number;
  }) => postData<SetVariableValueRequest[], VariableValue[]>(
    `/proposals/${proposalId}/variable-values`, 
    [{
      variable_id: -1, // Signals a new variable
      variable_name: data.name,
      variable_type: data.type,
      value: data.value
    }]
  ),
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
  syncWithTemplate: (proposalId: number) => 
    postData<Record<string, never>, { 
      success: boolean, 
      added_variables: string[], 
      updated_variables: string[],
      added_elements: string[] 
    }>(`/proposals/${proposalId}/sync-template`, {}),
};


// Contract API methods
export const contractApi = {
  list: () => fetchData<PaginatedResponse<Contract>>('/contracts'),
  getById: (id: number) => fetchData<Contract>(`/contracts/${id}`),
  clientSign: (id: number, data: SignContractRequest) => 
    putData<SignContractRequest, Contract>(`/contracts/${id}/client-sign`, data),
  contractorSign: (id: number, data: SignContractRequest) => 
    putData<SignContractRequest, Contract>(`/contracts/${id}/contractor-sign`, data),
  delete: (id: number) => deleteData<unknown>(`/contracts/${id}`),
  
  // Add file upload methods for signatures
  uploadClientSignature: (id: number, file: File, initials: string) => {
    const formData = new FormData();
    formData.append('signature_file', file);
    formData.append('initials', initials);
    return uploadFile<Contract>(`/contracts/${id}/upload-client-signature`, formData);
  },
  
  uploadContractorSignature: (id: number, file: File, initials: string) => {
    const formData = new FormData();
    formData.append('signature_file', file);
    formData.append('initials', initials);
    return uploadFile<Contract>(`/contracts/${id}/upload-contractor-signature`, formData);
  }
};