import { SortOption } from "./sort";

export interface TemplateProps {
  sortOption: SortOption;
  searchQuery?: string;
}

export interface TemplatePageProps {
  params: {
    id: number;
  };
}

export interface Element {
  id: number;
  name: string;
  material_cost: string;
  labor_cost: string;
}

export interface Category {
  id: number;
  name: string;
  elements: Element[];
}

export interface Variable {
  // id: number;
  name: string;
  type: string;
  value?: string;
  category?: string;
  
}

export interface Template {
  id: number;
  title: string;
  description: string;
  categories: Category[];
  variables: Variable[];
  created_at: string;
  image: File;
}

export interface TemplateDetailsProps {
  template: Template;
  onUpdateTemplate: (template: Template) => void;
  onNext: () => void;
}

export interface TemplateVariablesProps {
  variables: Variable[];
  onUpdateTemplate: (updater: (prevTemplate: Template) => Template) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export interface TemplateCategoriesProps {
  template: Template;
  onUpdateTemplate: (template: Template | ((prevTemplate: Template) => Template)) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export interface TemplatePreviewProps {
  template: Template;
  onPrevious: () => void;
  onSave: () => void;
}
