export type PageSize = "a4" | "letter" | "legal" | "short";

export interface Position {
  x: number;
  y: number;
}

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right'; // Add textAlign as an alternative to alignment
  fontFamily?: string; // Add support for font family
  lineHeight?: number; // Add support for line spacing
}

export type ElementType = 
  | "header" 
  | "text" 
  | "bulletList" 
  | "numberList" 
  | "table" 
  | "signature"
  | "columnLayout";

// Page interface to represent a single page in the contract
export interface Page {
  id: string;
  pageNumber: number;
}

// Base Element interface with formatting support
export interface ElementBase {
  id: string;
  type: ElementType;
  position: Position;
  content: any;
  isFloating?: boolean;
  formatting?: TextFormatting; // Add formatting to base element
  pageNumber?: number; // Add pageNumber to track which page the element belongs to
}

export interface HeaderElement extends ElementBase {
  type: "header";
  content: {
    text: string;
    level: 1 | 2 | 3;
  };
}

export interface TextElement extends ElementBase {
  type: "text";
  content: {
    text: string;
  };
}

export interface ListItem {
  id: string;
  text: string;
}

export interface BulletListElement extends ElementBase {
  type: "bulletList";
  content: {
    items: ListItem[];
  };
}

export interface NumberListElement extends ElementBase {
  type: "numberList";
  content: {
    items: ListItem[];
  };
}

export interface TableElement extends ElementBase {
  type: "table";
  content: {
    rows: number;
    cols: number;
    data: string[][];
  };
}

export interface SignatureElement extends ElementBase {
  type: "signature";
  isFloating: true;
  content: {
    initials: boolean;
    signatureType: string;
    label: string;
    imageData?: string; // Add imageData property that's being used in the code
  };
}

// Add a new interface for ColumnData
export interface ColumnData {
  id: string;
  width: number;
  elements: Element[];
}

export interface ColumnLayoutContent {
  columns: ColumnData[];
}

export interface ColumnLayoutElement extends ElementBase {
  type: "columnLayout";
  content: ColumnLayoutContent;
}

export type Element = 
  | HeaderElement 
  | TextElement 
  | BulletListElement 
  | NumberListElement 
  | TableElement 
  | SignatureElement
  | ColumnLayoutElement;