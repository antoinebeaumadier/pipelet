import { Block } from '../components/BlockEditor/types';
import { getNestedValue, setNestedValue } from './dataUtils';
import { transformValue } from './transformers';

/**
 * Executes the full pipeline with all blocks 
 */
export function applyPipeline(data: any[], blocks: Block[]) {
  const context: Record<string, any[]> = {
    input: data,
    raw_data: data,
  };

  for (const block of blocks) {
    const inputKey = block.input || "input";
    const inputData = context[inputKey];

    if (inputData === undefined) {
      console.warn(
        `Input "${inputKey}" not found for block "${block.outputName}"`
      );
      continue;
    }

    const result = applyBlockLogic(inputData, block, context);
    console.log("⛓️ Pipeline context so far:", context);

    if (block.outputName) {
      context[block.outputName] = result;
    }
  }

  const lastOutput = blocks[blocks.length - 1]?.outputName || "input";
  return context[lastOutput];
}

/**
 * Apply the logic for a specific block
 */
export function applyBlockLogic(
  data: any[],
  block: Block,
  context?: Record<string, any[]>
): any[] | string[] {
  try {
    switch (block.type) {
      case "filter": {
        return applyFilterBlock(data, block);
      }
      case "map": {
        return applyMapBlock(data, block);
      }
      case "convert": {
        return applyConvertBlock(data, block);
      }
      case "sort": {
        return applySortBlock(data, block);
      }
      case "merge": {
        return applyMergeBlock(data, block, context);
      }
      case "format": {
        return applyFormatBlock(data, block);
      }
      default:
        return data;
    }
  } catch (error) {
    console.error(`Error in block ${block.outputName || block.type}:`, error);
    block.hasError = true;
    return []; // Return empty array on error
  }
}

/**
 * Filter block implementation
 */
function applyFilterBlock(data: any[], block: Block): any[] {
  const { field, operator, value } = block.config;
  if (!field || !operator || value === undefined) return data;
  
  return data.filter((item) => {
    const itemVal = getNestedValue(item, field);
    const parsedVal = isNaN(Number(value)) ? value : Number(value);
    const parsedItemVal =
      typeof itemVal === "string" && !isNaN(Number(itemVal))
        ? Number(itemVal)
        : itemVal;

    switch (operator) {
      case ">":
        return parsedItemVal > parsedVal;
      case "<":
        return parsedItemVal < parsedVal;
      case "==":
        return parsedItemVal === parsedVal;
      case "!=":
        return parsedItemVal !== parsedVal;
      case ">=":
        return parsedItemVal >= parsedVal;
      case "<=":
        return parsedItemVal <= parsedVal;
      default:
        return true;
    }
  });
}

/**
 * Map block implementation
 */
function applyMapBlock(data: any[], block: Block): any[] {
  const {
    field,
    newField,
    transform,
    transformOption,
    keepNestedStructure,
  } = block.config;

  if (!field) return data;

  return data.map((item) => {
    const originalValue = getNestedValue(item, field);
    const transformedValue = transformValue(
      originalValue,
      transform,
      transformOption
    );

    const result = JSON.parse(JSON.stringify(item));

    const fieldPathParts = field.split(".");
    const target = newField?.trim() || fieldPathParts.at(-1)!;

    // If keeping structure and it's a nested field: rebuild the path
    let targetFieldPath: string;
    if (keepNestedStructure && fieldPathParts.length > 1) {
      const parentPath = fieldPathParts.slice(0, -1).join(".");
      targetFieldPath = `${parentPath}.${target}`;
    } else {
      targetFieldPath = newField?.trim() || field;
    }

    setNestedValue(result, targetFieldPath, transformedValue);
    return result;
  });
}

/**
 * Convert block implementation
 */
function applyConvertBlock(data: any[], block: Block): any[] | string[] {
  const { format } = block.config;
  if (format === "csv") {
    if (data.length === 0) return data;
    const keys = Object.keys(data[0] || {});
    const rows = data.map((obj) => keys.map((k) => obj[k]).join(","));
    return [keys.join(","), ...rows];
  }
  return data;
}

/**
 * Sort block implementation
 */
function applySortBlock(data: any[], block: Block): any[] {
  const { field, operator } = block.config;
  if (!field || !operator) return data;
  
  return [...data].sort((a, b) => {
    const aVal = getNestedValue(a, field);
    const bVal = getNestedValue(b, field);

    if (typeof aVal === "number" && typeof bVal === "number") {
      return operator === "asc" ? aVal - bVal : bVal - aVal;
    } else {
      return operator === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }
  });
}

function applyFormatBlock(data: any[], block: Block): any[] {
  const { template, newField = "formatted" } = block.config;
  const keepOriginal = !!block.config.keepOriginal;

  if (!template || !newField) return data;

  return data.map((item) => {
    const formatted = template.replace(/\{([^}]+)\}/g, (_, path) => {
      const value = getNestedValue(item, path);
      return value !== undefined ? value : "";
    });

    const result = keepOriginal ? { ...item } : {};
    result[newField] = formatted;
    return result;
  });
}

/**
 * Merge block implementation
 */
function applyMergeBlock(
  data: any[],
  block: Block,
  context?: Record<string, any[]>
): any[] {
  // Check if context is available
  if (!context) return data;

  const { mergeWith, mergeStrategy = "combine" } = block.config;

  if (!mergeWith || !context[mergeWith]) {
    // If no secondary source is specified, return original data
    return data;
  }

  const dataToMerge = context[mergeWith];

  switch (mergeStrategy) {
    case "override":
      // Replace existing records with those from the secondary source
      // using the first field as join key
      if (data.length === 0 || dataToMerge.length === 0)
        return [...data, ...dataToMerge];

      const keyField = Object.keys(data[0])[0];
      const mergedData = new Map();

      // First add all main data
      data.forEach((item) => {
        if (item[keyField]) {
          mergedData.set(item[keyField], item);
        }
      });

      // Then replace/add with data to merge
      dataToMerge.forEach((item) => {
        if (item[keyField]) {
          mergedData.set(item[keyField], item);
        }
      });

      return Array.from(mergedData.values());

    case "combine":
      // Combine fields from both sources
      if (data.length === 0) return dataToMerge;
      if (dataToMerge.length === 0) return data;

      // Assumes both arrays have same length and order
      // If not, a more complex logic would be needed
      return data.map((item, index) => {
        if (index < dataToMerge.length) {
          return { ...item, ...dataToMerge[index] };
        }
        return item;
      });

    case "append":
      // Simply concatenate both sources
      return [...data, ...dataToMerge];

    default:
      return data;
  }
}