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
    // Skip disabled blocks but maintain their input in the context
    if (block.enabled === false) {
      if (block.input) {
        context[block.outputName || block.type] = context[block.input];
      }
      continue;
    }

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
      case "aggregate": {
        return applyAggregateBlock(data, block);
      }
      case "structure": {
        return applyStructureBlock(data, block);
      }
      case "get": {
        return applyGetBlock(data, block);
      }
      case "reverse": {
        return applyReverseBlock(data);
      }
      case "pick": {
        return applyPickBlock(data, block);
      }
      case "mapObject": {
        return applyMapObjectBlock(data, block);
      }
      case "mapKeys": {
        return applyMapKeysBlock(data, block);
      }
      case "mapValues": {
        return applyMapValuesBlock(data, block);
      }
      case "createObject": {
        return applyCreateObjectBlock(data, block);
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
      originalValue !== undefined ? originalValue : '',
      transform || '',
      transformOption
    );

    // If newField is empty, transform the original value in place
    if (!newField?.trim()) {
      return setNestedValue(item, field, transformedValue);
    }

    const fieldPathParts = field.split(".");
    const target = newField.trim();

    // If keeping structure and it's a nested field: rebuild the path
    let targetFieldPath: string;
    if (keepNestedStructure && fieldPathParts.length > 1) {
      const parentPath = fieldPathParts.slice(0, -1).join(".");
      targetFieldPath = `${parentPath}.${target}`;
    } else {
      targetFieldPath = target;
    }

    // Create a new field with the transformed value
    return setNestedValue(item, targetFieldPath, transformedValue);
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
 * Aggregate block implementation
 */
function applyAggregateBlock(data: any[], block: Block): any[] {
  const { groupBy, aggregateFields } = block.config;
  
  if (!groupBy || !groupBy.length || !aggregateFields || !aggregateFields.length) {
    return data;
  }

  // Create a map to store grouped data
  const groupedData = new Map<string, { group: Record<string, any>; items: any[] }>();

  // Group the data
  data.forEach((item: any) => {
    const groupKey = groupBy.map(field => getNestedValue(item, field)).join('|');
    
    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, {
        group: groupBy.reduce((acc: Record<string, any>, field: string) => {
          acc[field] = getNestedValue(item, field);
          return acc;
        }, {}),
        items: []
      });
    }
    
    groupedData.get(groupKey)?.items.push(item);
  });

  // Apply aggregations to each group
  return Array.from(groupedData.values()).map(({ group, items }) => {
    const result = { ...group };
    
    aggregateFields.forEach(({ field, operation, newField }) => {
      const values = items.map(item => getNestedValue(item, field));
      
      switch (operation) {
        case 'sum':
          result[newField] = values.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
          break;
        case 'average':
          const sum = values.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
          result[newField] = sum / values.length;
          break;
        case 'count':
          result[newField] = values.length;
          break;
        case 'min':
          result[newField] = Math.min(...values.map((val: any) => Number(val) || Infinity));
          break;
        case 'max':
          result[newField] = Math.max(...values.map((val: any) => Number(val) || -Infinity));
          break;
      }
    });
    
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

  const { 
    mergeWith, 
    mergeStrategy = "combine",
    joinType = "inner",
    leftKey,
    rightKey
  } = block.config;

  if (!mergeWith || !context[mergeWith]) {
    // If no secondary source is specified, return original data
    return data;
  }

  const dataToMerge = context[mergeWith];

  // If no specific join type is specified, use the old merge strategies
  if (!joinType) {
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

  // SQL-like join implementation
  if (!leftKey || !rightKey) {
    console.warn("Join keys not specified for SQL-like join");
    return data;
  }

  // Helper function to normalize join key values
  const normalizeValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? '1' : '0';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Create maps for faster lookups
  const leftMap = new Map();
  const rightMap = new Map();

  // Build left map
  data.forEach(item => {
    const value = getNestedValue(item, leftKey);
    if (value !== undefined) {
      const key = normalizeValue(value);
      if (!leftMap.has(key)) {
        leftMap.set(key, []);
      }
      leftMap.get(key).push(item);
    }
  });

  // Build right map
  dataToMerge.forEach(item => {
    const value = getNestedValue(item, rightKey);
    if (value !== undefined) {
      const key = normalizeValue(value);
      if (!rightMap.has(key)) {
        rightMap.set(key, []);
      }
      rightMap.get(key).push(item);
    }
  });

  const result: any[] = [];

  switch (joinType) {
    case "inner":
      // Inner join: only include records that match in both datasets
      Array.from(leftMap.entries()).forEach(([key, leftItems]) => {
        if (rightMap.has(key)) {
          const rightItems = rightMap.get(key);
          leftItems.forEach((leftItem: Record<string, any>) => {
            rightItems.forEach((rightItem: Record<string, any>) => {
              result.push({ ...leftItem, ...rightItem });
            });
          });
        }
      });
      break;

    case "left":
      // Left join: include all records from left dataset, with matching right records if they exist
      Array.from(leftMap.entries()).forEach(([key, leftItems]) => {
        const rightItems = rightMap.get(key) || [{}];
        leftItems.forEach((leftItem: Record<string, any>) => {
          rightItems.forEach((rightItem: Record<string, any>) => {
            result.push({ ...leftItem, ...rightItem });
          });
        });
      });
      break;

    case "right":
      // Right join: include all records from right dataset, with matching left records if they exist
      Array.from(rightMap.entries()).forEach(([key, rightItems]) => {
        const leftItems = leftMap.get(key) || [{}];
        leftItems.forEach((leftItem: Record<string, any>) => {
          rightItems.forEach((rightItem: Record<string, any>) => {
            result.push({ ...leftItem, ...rightItem });
          });
        });
      });
      break;

    case "full":
      // Full outer join: include all records from both datasets
      const allKeys = new Set([
        ...Array.from(leftMap.keys()),
        ...Array.from(rightMap.keys())
      ]);
      Array.from(allKeys).forEach(key => {
        const leftItems = leftMap.get(key) || [{}];
        const rightItems = rightMap.get(key) || [{}];
        leftItems.forEach((leftItem: Record<string, any>) => {
          rightItems.forEach((rightItem: Record<string, any>) => {
            result.push({ ...leftItem, ...rightItem });
          });
        });
      });
      break;

    default:
      console.warn(`Unknown join type: ${joinType}`);
      return data;
  }

  return result;
}

/**
 * Structure block implementation
 */
function applyStructureBlock(data: any[], block: Block): any[] {
  const { operation, template = '{}', separator = '_' } = block.config;

  switch (operation) {
    case 'flatten':
      return data.map(item => flattenObject(item, separator));
    case 'unflatten':
      return data.map(item => unflattenObject(item, separator));
    case 'restructure':
      return data.map(item => restructureObject(item, template));
    default:
      return data;
  }
}

/**
 * Flatten a nested object into a single level object
 */
function flattenObject(obj: any, separator: string = '_', prefix: string = ''): any {
  return Object.keys(obj).reduce((acc: any, key: string) => {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], separator, newKey));
    } else {
      acc[newKey] = obj[key];
    }
    
    return acc;
  }, {});
}

/**
 * Unflatten a flattened object back into a nested structure
 */
function unflattenObject(obj: any, separator: string = '_'): any {
  const result: any = {};
  
  Object.keys(obj).forEach(key => {
    const keys = key.split(separator);
    let current = result;
    
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        current[k] = obj[key];
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    }
  });
  
  return result;
}

/**
 * Restructure an object according to a template
 */
function restructureObject(obj: any, template: string): any {
  try {
    // Try to parse as JSON first
    let templateObj;
    try {
      templateObj = JSON.parse(template);
    } catch (e) {
      // If parsing fails, try to fix the template by adding quotes around keys
      const fixedTemplate = template.replace(/(\w+):/g, '"$1":');
      templateObj = JSON.parse(fixedTemplate);
    }
    
    // Start with a copy of the original object
    const result = JSON.parse(JSON.stringify(obj));
    
    Object.entries(templateObj).forEach(([newKey, oldPath]) => {
      if (typeof oldPath === 'string') {
        const value = getNestedValue(obj, oldPath);
        if (value !== undefined) {
          // If newKey contains dots, we need to create the nested structure
          if (newKey.includes('.')) {
            setNestedValue(result, newKey, value);
          } else {
            // Simple case: just set the value directly
            result[newKey] = value;
          }
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing template:', error);
    return obj;
  }
}

function getValueByPath(obj: any, path: string): any {
  if (!path) return obj;
  
  // Remove leading dot if present
  const cleanPath = path.startsWith('.') ? path.slice(1) : path;
  
  // Split path into parts
  const parts = cleanPath.split('.');
  
  // Traverse the object
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) {
      console.log(`Path ${path} not found at part ${part}`);
      return null;
    }
    current = current[part];
  }
  
  console.log(`Found value for path ${path}:`, current);
  return current;
}

function applyGetBlock(data: any[], block: Block): any[] {
  const path = block.config.path || '';
  console.log('Applying get block with path:', path);
  console.log('Input data:', data);
  
  const result = data.map(item => {
    const value = getValueByPath(item, path);
    console.log('Item:', item, 'Value:', value);
    return value;
  });
  
  console.log('Get block result:', result);
  return result;
}

function applyReverseBlock(data: any[]): any[] {
  console.log('Applying reverse block');
  console.log('Input data:', data);
  
  const result = [...data].reverse();
  console.log('Reversed data:', result);
  return result;
}

function pickProperties(obj: any, properties: string[]): any {
  if (!properties || properties.length === 0) return obj;
  
  const result: any = {};
  
  for (const property of properties) {
    const value = getValueByPath(obj, property);
    if (value !== null && value !== undefined) {
      // Use the last part of the path as the key
      const key = property.split('.').pop() || property;
      result[key] = value;
    }
  }
  
  return result;
}

function applyPickBlock(data: any[], block: Block): any[] {
  const properties = block.config.properties || [];
  console.log('Applying pick block with properties:', properties);
  console.log('Input data:', data);
  
  // Handle single object case
  if (!Array.isArray(data)) {
    return pickProperties(data, properties);
  }
  
  const result = data.map(item => pickProperties(item, properties));
  console.log('Picked data:', result);
  return result;
}

/**
 * MapObject block implementation
 */
function applyMapObjectBlock(data: any[], block: Block): any[] {
  const { keyTransform, valueTransform } = block.config;
  
  if (!keyTransform && !valueTransform) return data;

  return data.map(item => {
    // Skip if item is not an object
    if (typeof item !== 'object' || item === null) return item;

    const result: Record<string, any> = {};
    
    // Process each key-value pair in the object
    Object.entries(item).forEach(([key, value]) => {
      let newKey = key;
      let newValue = value;

      // Apply key transformation if specified
      if (keyTransform) {
        try {
          // Replace .key and .value in the transform string
          const transformedKey = keyTransform
            .replace(/\.key/g, `"${key}"`)
            .replace(/\.value/g, JSON.stringify(value));
          newKey = eval(transformedKey);
        } catch (error) {
          console.error('Error transforming key:', error);
        }
      }

      // Apply value transformation if specified
      if (valueTransform) {
        try {
          // Replace .key and .value in the transform string
          const transformedValue = valueTransform
            .replace(/\.key/g, `"${key}"`)
            .replace(/\.value/g, JSON.stringify(value));
          newValue = eval(transformedValue);
        } catch (error) {
          console.error('Error transforming value:', error);
        }
      }

      result[newKey] = newValue;
    });

    return result;
  });
}

/**
 * MapKeys block implementation
 */
function applyMapKeysBlock(data: any[], block: Block): any[] {
  const { keyCallback } = block.config;
  
  if (!keyCallback) return data;

  return data.map(item => {
    // Skip if item is not an object
    if (typeof item !== 'object' || item === null) return item;

    const result: Record<string, any> = {};
    
    // Process each key-value pair in the object
    Object.entries(item).forEach(([key, value]) => {
      try {
        // Create a function that takes the key as input
        const transformFn = new Function('key', `return ${keyCallback.replace(/\.key/g, 'key')}`);
        const newKey = transformFn(key);
        result[newKey] = value;
      } catch (error) {
        console.error('Error transforming key:', error);
      }
    });

    return result;
  });
}

/**
 * MapValues block implementation
 */
function applyMapValuesBlock(data: any[], block: Block): any[] {
  const { valueCallback } = block.config;
  
  if (!valueCallback) return data;

  return data.map(item => {
    // Skip if item is not an object
    if (typeof item !== 'object' || item === null) return item;

    const result: Record<string, any> = {};
    
    // Process each key-value pair in the object
    Object.entries(item).forEach(([key, value]) => {
      try {
        // Create a function that takes the value as input
        const transformFn = new Function('value', `return ${valueCallback.replace(/\.value/g, 'value')}`);
        const newValue = transformFn(value);
        result[key] = newValue;
      } catch (error) {
        console.error('Error transforming value:', error);
      }
    });

    return result;
  });
}

function applyCreateObjectBlock(data: any[], block: Block): any[] {
  const { objectTemplate } = block.config;
  if (!objectTemplate) return data;

  const createObject = (template: any) => {
    const result: Record<string, any> = {};
    
    template.forEach((item: any) => {
      if (item.isNested && item.children) {
        result[item.key] = createObject(item.children);
      } else {
        result[item.key] = item.value;
      }
    });
    
    return result;
  };

  return data.map(() => createObject(objectTemplate));
}