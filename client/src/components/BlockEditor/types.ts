// Define block types
export const BLOCK_TYPES = ["filter", "map", "convert", "sort", "merge", "format"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

// Configuration for different block types
export interface BlockConfig {
  field?: string;
  operator?: string;
  value?: string;
  newField?: string;
  format?: string;
  transform?: string;
  transformOption?: string;
  keepNestedStructure?: boolean;
  mergeWith?: string;
  mergeStrategy?: "override" | "combine" | "append";
  template?: string;
  keepOriginal?: boolean;
}

// Block structure
export interface Block {
  id: string;
  type: BlockType;
  config: BlockConfig;
  outputName?: string;
  input?: string;
  hasError?: boolean;
}

// Props for components
export interface FieldSelectorProps {
  allFields: string[];
  currentValue?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  placeholder: string;
  inputData: any[] | null;
  className?: string;
}

export interface BlockPreviewProps {
  outputData: any[] | null;
  isOpen: boolean;
  onToggle: () => void;
  blockName: string;
}

export interface InputBlockProps {
  inputData: any[];
  fileName: string | null;
}

export interface SortableBlockProps {
  block: Block;
  onChange: (block: Block) => void;
  onDelete: (id: string) => void;
  allFields: string[];
  inputData: any[] | null;
  isDraggingThis?: boolean;
  availableInputs: string[];
  inputFileName: string | null;
  blockOutput: any[] | null;
}