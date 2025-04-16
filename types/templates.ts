import { SortOption } from "./sort";
import { Element as ElementCategory } from "@/hooks/api/lookup/use-categories";

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
  description: string;
  formula: string;
  labor_formula: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: number;
  name: string;
  elements: ElementCategory[];
  // description: string;
  // created_at: string;
  // updated_at: string;
}
export interface Parameters {
  id: number;
  name?: string;
  type?: string;
  value?: string;
}

export interface TemplateElements {
  id: number;
  element: Element;
  material_cost: string
  labor_cost: string;
  image: string;
  created_at: string;
  updated_at: string;
  module: Module;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  modules: Module[];
  parameters: Parameters[];
  template_elements: TemplateElements[];
  created_at: string;
  updated_at: string;
  image: string;
}

export interface TemplateDetailsProps {
  template: Template;
  onUpdateTemplate: (template: Template) => void;
  onNext: () => void;
}

export interface TemplateParametersProps {
  parameter: Parameters[];
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
