// Define block types
export const BLOCK_TYPES = ["filter", "map", "convert", "sort", "merge", "format", "groupBy", "flatten", "get", "reverse", "pick", "mapObject", "mapKeys", "mapValues", "createObject", "createArray", "keyBy", "keys", "values", "join", "split", "unique", "limit", "length", "min", "max", "regex", "validate"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export interface ObjectTemplateItem {
  key: string;
  value: string;
  isNested?: boolean;
  children?: ObjectTemplateItem[];
}

export interface ArrayTemplateItem {
  value: string;
}

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
  mergeStrategy?: "override" | "combine" | "append" | "union";
  joinType?: "inner" | "left" | "right" | "full";
  leftKey?: string;
  rightKey?: string;
  joinKey?: string;
  template?: string;
  keepOriginal?: boolean;
  // GroupBy block specific config
  groupBy?: string;
  aggregateFields?: {
    field: string;
    operation: "sum" | "average" | "count" | "min" | "max" | "product";
    newField: string;
  }[];
  condition?: string;
  typeCheck?: string;
  // Structure block specific config
  operation?: "flatten" | "unflatten" | "restructure" | "flattenArray";
  separator?: string;
  // Get block specific config
  path?: string;
  // Pick block specific config
  properties?: string[];
  // MapObject block specific config
  keyTransform?: string;
  valueTransform?: string;
  // MapKeys block specific config
  keyCallback?: string;
  // MapValues block specific config
  valueCallback?: string;
  // CreateObject block specific config
  objectTemplate?: ObjectTemplateItem[];
  // CreateArray block specific config
  arrayTemplate?: ArrayTemplateItem[];
  // KeyBy block specific config
  keyField?: string;
  // Keys block specific config
  recursive?: boolean;
  // Values block specific config
  valuesRecursive?: boolean;
  // Split block specific config
  splitCharacters?: boolean;
  // Unique block specific config
  compareProperty?: string;
  // Limit block specific config
  limit?: number;
  size?: boolean;
  // Min block specific config
  minRecursive?: boolean;
  min?: number | string;
  // Max block specific config
  maxRecursive?: boolean;
  max?: number | string;
  // Regex block specific config
  pattern?: string;
  flags?: string;
  // Convert block specific config
  delimiter?: string;
  hasHeader?: boolean;
  prettyPrint?: boolean;
  indentation?: string;
  namespaceHandling?: "preserve" | "strip" | "prefix";
  encoding?: string;
  // Validate block specific config
  validationType?: "schema" | "rule" | "type" | "required" | "pattern" | "range" | "custom";
  schema?: string;
  rules?: {
    field: string;
    rule: string;
    errorMessage?: string;
  }[];
  failOnError?: boolean;
  addValidationFields?: boolean;
}

// Block structure
export interface Block {
  id: string;
  type: BlockType;
  config: BlockConfig;
  outputName?: string;
  input?: string;
  hasError?: boolean;
  enabled?: boolean;
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
  onBlockChange: (block: Block) => void;
  onBlockDelete: (blockId: string) => void;
  allFields: string[];
  inputData: any[] | null;
  isDraggingThis: boolean;
  availableInputs: string[];
  inputFileName: string | null;
  blockOutput: any[] | null;
  context?: Record<string, any[]>;
  blocks: Block[];
  index: number;
  onBlockDuplicate?: (block: Block) => void;
  onBlockMove?: (fromIndex: number, toIndex: number) => void;
}