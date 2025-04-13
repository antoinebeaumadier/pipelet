import { Block } from '../components/BlockEditor/types';
import { getNestedValue, setNestedValue } from './dataUtils';
import { transformValue } from './transformers';

/**
 * Executes the full pipeline with all blocks 
 */
export function applyPipeline(data: any[], blocks: Block[]) {
  // Initialize context with both input and raw_data
  const context: Record<string, any[]> = {
    input: data,
    raw_data: data,
  };

  // Keep track of the original input data
  const originalInput = [...data];

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

    // Always ensure input is available in context
    context.input = originalInput;

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
        return applyFilterBlock(data, block, context);
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
        return applyFormatBlock(data, block, context);
      }
      case "groupBy": {
        return applyGroupByBlock(data, block);
      }
      case "flatten": {
        return applyFlattenBlock(data, block);
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
        return applyCreateObjectBlock(data, block, context);
      }
      case "createArray": {
        return applyCreateArrayBlock(data, block, context);
      }
      case "keyBy": {
        return applyKeyByBlock(data, block);
      }
      case "keys": {
        return applyKeysBlock(data, block);
      }
      case "values": {
        return applyValuesBlock(data, block);
      }
      case "join": {
        return applyJoinBlock(data, block);
      }
      case "split": {
        return applySplitBlock(data, block);
      }
      case "unique": {
        return applyUniqueBlock(data, block);
      }
      case "limit": {
        return applyLimitBlock(data, block);
      }
      case "length": {
        return applyLengthBlock(data, block);
      }
      case "min": {
        return applyMinBlock(data, block);
      }
      case "max": {
        return applyMaxBlock(data, block);
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
function applyFilterBlock(data: any[], block: Block, context?: Record<string, any[]>): any[] {
  const { field, operator, value } = block.config;
  if (!field || !operator || value === undefined) return data;
  
  // Create context for evaluation if not provided
  const evalContext = context || { input: data };
  
  // Evaluate the value if it contains references
  const evaluatedValue = evaluateStepReference(value, evalContext);
  
  return data.filter((item) => {
    const itemVal = getNestedValue(item, field);
    const parsedVal = isNaN(Number(evaluatedValue)) ? evaluatedValue : Number(evaluatedValue);
    const parsedItemVal =
      typeof itemVal === "string" && !isNaN(Number(itemVal))
        ? Number(itemVal)
        : itemVal;

    switch (operator) {
      case ">":
        return parsedItemVal > parsedVal;
      case "<":
        return parsedItemVal < parsedVal;
      case "=":
        return parsedItemVal === parsedVal;
      case "!=":
        return parsedItemVal !== parsedVal;
      case ">=":
        return parsedItemVal >= parsedVal;
      case "<=":
        return parsedItemVal <= parsedVal;
      case "contains":
        return String(itemVal).includes(String(parsedVal));
      case "not_contains":
        return !String(itemVal).includes(String(parsedVal));
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

    // Special case for keepOnly transform - return an object with only this field
    if (transform === "keepOnly") {
      if (newField?.trim()) {
        // If newField is specified, use that as the property name
        return { [newField.trim()]: transformedValue };
      }
      
      // Otherwise use the original field name (getting the last part of the path)
      const fieldParts = field.split(".");
      const fieldName = fieldParts[fieldParts.length - 1];
      return { [fieldName]: transformedValue };
    }

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
  
  if (!format) return data;
  
  try {
    switch (format) {
      case "csv": {
        if (data.length === 0) return data;
        
        // Get all unique keys from all objects
        const keys = Array.from(
          new Set(
            data.flatMap((obj) => Object.keys(obj))
          )
        );

        // Escape CSV values properly
        const escapeCsvValue = (value: any): string => {
          if (value === null || value === undefined) return '';
          const str = String(value);
          // If the string contains commas, quotes, or newlines, wrap it in quotes and escape quotes
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        // Create header row
        const headerRow = keys.map(escapeCsvValue).join(',');
        
        // Create data rows
        const rows = data.map((obj) => 
          keys.map((key) => {
            const value = obj[key];
            // Handle nested objects by converting them to JSON strings
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              return escapeCsvValue(JSON.stringify(value));
            }
            return escapeCsvValue(value);
          }).join(',')
        );

        return [headerRow, ...rows];
      }
      
      case "json": {
        return [JSON.stringify(data, null, 2)];
      }
      
      case "xml": {
        const convertToXml = (obj: any, rootName: string = 'root'): string => {
          const convertValue = (value: any): string => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') {
              return convertToXml(value, 'item');
            }
            return String(value);
          };

          if (Array.isArray(obj)) {
            return obj.map(item => convertToXml(item, 'item')).join('');
          }

          const entries = Object.entries(obj);
          if (entries.length === 0) return `<${rootName}/>`;

          const content = entries.map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return convertToXml(value, key);
            }
            return `<${key}>${convertValue(value)}</${key}>`;
          }).join('');

          return `<${rootName}>${content}</${rootName}>`;
        };

        return [`<?xml version="1.0" encoding="UTF-8"?>\n${convertToXml(data)}`];
      }
      
      default:
        return data;
    }
  } catch (error) {
    console.error('Error in convert block:', error);
    return data;
  }
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

/**
 * Evaluate references to previous step values in a string
 * Rules:
 * - $ prefix is required for all variable references: $stepName, $input
 * - Dot notation after $input maps across all items (returns array)
 * - Array indexing is supported: $stepName[index].property, $input[index].property
 */
function evaluateStepReference(value: string, context?: Record<string, any[]>): any {
  if (!context || typeof value !== 'string') {
    return value;
  }

  // If the value ends with a dot or contains an incomplete array index, it's an incomplete reference
  if (value.endsWith('.') || value.includes('[') && !value.includes(']')) {
    return value;
  }

  console.log("Evaluating reference:", value, "with context:", context);

  // Split the value into parts based on + operator
  const parts = value.split(/(?<!\$[a-zA-Z0-9_]+)\s*\+\s*(?!\s*\$[a-zA-Z0-9_]+)/);
  
  // If there's only one part, evaluate it normally
  if (parts.length === 1) {
    return evaluateSingleReference(value, context);
  }

  // Evaluate each part and concatenate the results
  return parts.map(part => evaluateSingleReference(part.trim(), context)).join(' + ');
}

function evaluateSingleReference(value: string, context: Record<string, any[]>): any {
  // Check for $input with dot notation (should map all items)
  if (value.startsWith('$input.')) {
    const fieldPath = value.slice(7); // Remove '$input.'
    if (context.input && context.input.length > 0) {
      // Map all items in input array to get the specified field from each
      return context.input.map(item => getNestedValue(item, fieldPath));
    }
    return value;
  }

  // Check for $input with array index: $input[0].property
  const inputArrayRegex = /^\$input\[(\d+)\]((?:\.\w+|\[\d+\])*)(.*)$/;
  const inputMatch = value.match(inputArrayRegex);
  
  if (inputMatch) {
    const [, indexStr, remainingPath = '', extraText = ''] = inputMatch;
    const index = parseInt(indexStr, 10);
    
    if (context.input && Array.isArray(context.input) && context.input.length > index) {
      let current = context.input[index];
      
      // If no remaining path, return the whole object at this index
      if (!remainingPath) {
        return current + extraText;
      }
      
      // Process the remaining path
      const result = processPath(current, remainingPath, value);
      return result !== value ? result + extraText : value;
    }
    return value;
  }

  // Check for $stepName with array index: $stepName[index].property
  const stepArrayRegex = /^\$([a-zA-Z0-9_]+)\[(\d+)\]((?:\.\w+|\[\d+\])*)(.*)$/;
  const stepArrayMatch = value.match(stepArrayRegex);
  
  if (stepArrayMatch) {
    const [, stepName, indexStr, remainingPath = '', extraText = ''] = stepArrayMatch;
    const index = parseInt(indexStr, 10);
    
    if (context[stepName] && Array.isArray(context[stepName]) && context[stepName].length > index) {
      let current = context[stepName][index];
      
      // If no remaining path, return the whole object at this index
      if (!remainingPath) {
        return current + extraText;
      }
      
      // Process the remaining path
      const result = processPath(current, remainingPath, value);
      return result !== value ? result + extraText : value;
    }
    return value;
  }

  // Check for $stepName with dot notation: $stepName.property
  const stepRefRegex = /^\$([a-zA-Z0-9_]+)\.([\w\.]+)(.*)$/;
  const stepMatch = value.match(stepRefRegex);
  
  if (stepMatch) {
    const [, stepName, fieldPath, extraText = ''] = stepMatch;
    
    if (context[stepName] && context[stepName].length > 0) {
      // Get the field from the first item in the step
      const result = getNestedValue(context[stepName][0], fieldPath);
      return result !== undefined ? result + extraText : value;
    }
    return value;
  }
  
  return value;
}

function processPath(current: any, path: string, originalValue: string): any {
  if (!path) return current;
  
  const pathParts = path.split(/(?=\[|\.)/).map(part => part.replace(/^\./, ''));
  
  for (const part of pathParts) {
    if (!part) continue;
    
    // Handle array indexing
    if (part.match(/^\[\d+\]$/)) {
      const index = parseInt(part.slice(1, -1), 10);
      if (Array.isArray(current)) {
        current = current[index];
      } else {
        console.warn(`Invalid path: tried to access index ${index} on non-array:`, current);
        return originalValue;
      }
    } 
    // Handle regular property access
    else {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        console.warn(`Invalid path: tried to access property ${part} on non-object:`, current);
        return originalValue;
      }
    }
    
    if (current === undefined || current === null) {
      return originalValue;
    }
  }
  
  return current;
}

function applyFormatBlock(data: any[], block: Block, context?: Record<string, any[]>): any[] {
  const { template, newField = "formatted" } = block.config;
  const keepOriginal = !!block.config.keepOriginal;

  if (!template) return data;

  // Ensure context has input data and maintain the original input
  if (!context) {
    context = { input: data };
  } else if (!context.input) {
    context.input = data;
  }

  // Log the context for debugging
  console.log("Format block context:", context);

  return data.map((item) => {
    // First evaluate any step references in the template
    let evaluatedTemplate = template;
    
    // Find all $input and $stepName references
    const refRegex = /\$(?:input|\w+)(?:\[\d+\])?(?:\.\w+)+/g;
    const matches = template.match(refRegex) || [];
    
    // Evaluate each reference and replace in template
    matches.forEach(match => {
      const evaluated = evaluateStepReference(match, context);
      if (evaluated !== match) {
        evaluatedTemplate = evaluatedTemplate.replace(match, evaluated);
      }
    });
    
    // Then replace field references with values from the current item
    const formatted = evaluatedTemplate.replace(/\{([^}]+)\}/g, (_match: string, path: string) => {
      const value = getNestedValue(item, path);
      return value !== undefined ? value : "";
    });

    // If keepOriginal is true, add the formatted value to the existing item
    if (keepOriginal) {
      return {
        ...item,
        [newField]: formatted
      };
    }
    
    // If keepOriginal is false, return just the formatted value
    return {
      [newField]: formatted
    };
  });
}

/**
 * GroupBy block implementation
 */
function applyGroupByBlock(data: any[], block: Block): any[] {
  const { groupBy, aggregateFields } = block.config;
  
  if (!groupBy) {
    // If no groupBy is specified (root object), treat the entire array as one group
    const groupResult: Record<string, any> = {};
    
    if (aggregateFields) {
      aggregateFields.forEach(({ field, operation, newField }) => {
        const values = data.map(item => getNestedValue(item, field));
        
        switch (operation) {
          case 'sum':
            groupResult[newField] = values.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
            break;
          case 'average':
            const sum = values.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
            groupResult[newField] = sum / values.length;
            break;
          case 'count':
            groupResult[newField] = values.length;
            break;
          case 'min':
            groupResult[newField] = Math.min(...values.map((val: any) => Number(val) || Infinity));
            break;
          case 'max':
            groupResult[newField] = Math.max(...values.map((val: any) => Number(val) || -Infinity));
            break;
          case 'product':
            groupResult[newField] = values.reduce((product: number, val: any) => product * (Number(val) || 1), 1);
            break;
        }
      });
    }
    
    return [groupResult];
  }

  // Create a map to store grouped data
  const groupedData = new Map<string, any[]>();

  // Group the data
  data.forEach((item: any) => {
    const groupKey = getNestedValue(item, groupBy);
    if (groupKey === undefined) return;

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, []);
    }
    groupedData.get(groupKey)?.push(item);
  });

  // If no aggregations are specified, return the grouped data as an object
  if (!aggregateFields || !aggregateFields.length) {
    return [Object.fromEntries(groupedData)];
  }

  // Apply aggregations to each group
  const result = Array.from(groupedData.entries()).map(([key, items]) => {
    const groupResult: Record<string, any> = { [groupBy]: key };
    
    aggregateFields.forEach(({ field, operation, newField }) => {
      const values = items.map(item => getNestedValue(item, field));
      
      switch (operation) {
        case 'sum':
          groupResult[newField] = values.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
          break;
        case 'average':
          const sum = values.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
          groupResult[newField] = sum / values.length;
          break;
        case 'count':
          groupResult[newField] = values.length;
          break;
        case 'min':
          groupResult[newField] = Math.min(...values.map((val: any) => Number(val) || Infinity));
          break;
        case 'max':
          groupResult[newField] = Math.max(...values.map((val: any) => Number(val) || -Infinity));
          break;
        case 'product':
          groupResult[newField] = values.reduce((product: number, val: any) => product * (Number(val) || 1), 1);
          break;
      }
    });
    
    return groupResult;
  });

  return result;
}

/**
 * Flatten block implementation
 */
function applyFlattenBlock(data: any[], block: Block): any[] {
  const { operation, template = '{}', separator = '_' } = block.config;

  switch (operation) {
    case 'flatten':
      return data.map(item => flattenObject(item, separator));
    case 'unflatten':
      return data.map(item => unflattenObject(item, separator));
    case 'flattenArray':
      return data.flatMap(item => {
        // Only flatten if the item is an array of arrays
        if (Array.isArray(item) && item.some(Array.isArray)) {
          return item.flat();
        }
        return item;
      });
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

function applyCreateObjectBlock(data: any[], block: Block, context?: Record<string, any[]>): any[] {
  const { objectTemplate } = block.config;
  if (!objectTemplate) return [];

  const createObject = (template: any) => {
    const result: Record<string, any> = {};
    
    template.forEach((item: any) => {
      if (item.isNested && item.children) {
        result[item.key] = createObject(item.children);
      } else {
        // Evaluate potential step references in the value
        result[item.key] = evaluateStepReference(item.value, context);
      }
    });
    
    return result;
  };

  return [createObject(objectTemplate)];
}

function applyCreateArrayBlock(data: any[], block: Block, context?: Record<string, any[]>): any[] {
  const { arrayTemplate } = block.config;
  if (!arrayTemplate) return [];

  // Convert string values to their appropriate types and evaluate references
  const result = arrayTemplate.map(item => {
    // First check if it's a reference to a previous step
    const evaluatedValue = evaluateStepReference(item.value, context);
    
    // If it's the same as the original, try to parse as JSON
    if (evaluatedValue === item.value) {
      try {
        // Try to parse as JSON first
        return JSON.parse(item.value);
      } catch (e) {
        // If not valid JSON, return as string
        return item.value;
      }
    }
    
    // Return the evaluated value
    return evaluatedValue;
  });

  return result;
}

/**
 * Deep merge two objects
 */
function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || typeof source !== 'object') {
    return source;
  }

  const result = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] instanceof Object && key in target) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  });

  return result;
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
        if (!Array.isArray(data) || !Array.isArray(dataToMerge)) {
          console.warn("Invalid input: both datasets must be arrays");
          return data;
        }
        if (data.length === 0) return dataToMerge;
        if (dataToMerge.length === 0) return data;

        // Use a configurable join key instead of the first field
        const combineJoinKey = block.config.joinKey || Object.keys(data[0])[0];
        
        const combineDataMap = new Map();
        data.forEach(item => {
          const key = getNestedValue(item, combineJoinKey);
          if (key !== undefined) {
            combineDataMap.set(key, item);
          }
        });

        return dataToMerge.map(item => {
          const key = getNestedValue(item, combineJoinKey);
          if (key !== undefined && combineDataMap.has(key)) {
            return deepMerge(combineDataMap.get(key), item);
          }
          return item;
        });

      case "append":
        if (!Array.isArray(data) || !Array.isArray(dataToMerge)) {
          console.warn("Invalid input: both datasets must be arrays");
          return data;
        }
        return [...data, ...dataToMerge];

      case "union":
        if (!Array.isArray(data) || !Array.isArray(dataToMerge)) {
          console.warn("Invalid input: both datasets must be arrays");
          return data;
        }
        if (data.length === 0) return dataToMerge;
        if (dataToMerge.length === 0) return data;

        // Use a configurable join key
        const unionJoinKey = block.config.joinKey || Object.keys(data[0])[0];
        
        // Create maps for both datasets
        const unionDataMap = new Map();
        const unionMergeMap = new Map();
        
        // Build maps for both datasets
        data.forEach(item => {
          const key = getNestedValue(item, unionJoinKey);
          if (key !== undefined) {
            unionDataMap.set(key, item);
          }
        });

        dataToMerge.forEach(item => {
          const key = getNestedValue(item, unionJoinKey);
          if (key !== undefined) {
            unionMergeMap.set(key, item);
          }
        });

        // Get all unique keys from both datasets
        const allKeys = new Set([
          ...Array.from(unionDataMap.keys()),
          ...Array.from(unionMergeMap.keys())
        ]);
        
        // Process each key
        return Array.from(allKeys).map(key => {
          const leftItem = unionDataMap.get(key);
          const rightItem = unionMergeMap.get(key);
          
          if (leftItem && rightItem) {
            // If both datasets have the item, deep merge them
            return deepMerge(leftItem, rightItem);
          } else if (leftItem) {
            // If only left dataset has the item, use it
            return leftItem;
          } else {
            // If only right dataset has the item, use it
            return rightItem;
          }
        });

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
 * KeyBy block implementation
 */
function applyKeyByBlock(data: any[], block: Block): any[] {
  const { keyField } = block.config;
  if (!keyField) return data;

  const result: Record<string, any> = {};

  data.forEach((item) => {
    const key = getNestedValue(item, keyField);
    if (key !== undefined && !result.hasOwnProperty(key)) {
      result[key] = item;
    }
  });

  return [result];
}

function applyKeysBlock(data: any[], block: Block): any[] {
  if (!data || data.length === 0) return [];
  
  const { field, recursive } = block.config;
  
  // Create a function to collect keys recursively if needed
  const collectKeys = (obj: any, recursive: boolean): string[] => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return [];
    }
    
    const keys = Object.keys(obj);
    
    if (!recursive) {
      return keys;
    }
    
    // If recursive, also collect keys from nested objects
    const allKeys = new Set(keys);
    
    for (const key of keys) {
      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nestedKeys = collectKeys(value, true)
          .map(nestedKey => `${key}.${nestedKey}`);
        
        nestedKeys.forEach(nestedKey => allKeys.add(nestedKey));
      }
    }
    
    return Array.from(allKeys);
  };
  
  return data.map(item => {
    // If a field is specified, get keys for that field
    // Otherwise, get keys for the entire item
    const targetObj = field ? getNestedValue(item, field) : item;
    return collectKeys(targetObj, !!recursive);
  });
}

function applyValuesBlock(data: any[], block: Block): any[] {
  if (!data || data.length === 0) return [];
  
  const { field, valuesRecursive } = block.config;
  
  // Create a function to collect values recursively if needed
  const collectValues = (obj: any, recursive: boolean): any[] => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return [];
    }
    
    const values = Object.values(obj);
    
    if (!recursive) {
      return values;
    }
    
    // If recursive, also collect values from nested objects
    const allValues: any[] = [];
    
    // First add all direct values
    for (const value of values) {
      // Only add non-object values directly
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        allValues.push(value);
      } else {
        // For objects, get their values recursively
        const nestedValues = collectValues(value, true);
        allValues.push(...nestedValues);
      }
    }
    
    return allValues;
  };
  
  return data.map(item => {
    // If a field is specified, get values for that field
    // Otherwise, get values for the entire item
    const targetObj = field ? getNestedValue(item, field) : item;
    return collectValues(targetObj, !!valuesRecursive);
  });
}

/**
 * Join block implementation
 * Concatenates array items into a string with an optional separator
 */
function applyJoinBlock(data: any[], block: Block): any[] {
  const { separator = "" } = block.config;
  
  if (!Array.isArray(data)) {
    return [String(data)];
  }
  
  // Handle both array of primitives and array of objects
  if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
    // For array of objects, convert each object to string (JSON format)
    const stringValues = data.map(item => JSON.stringify(item));
    return [stringValues.join(separator)];
  } else {
    // For array of primitives, simply join them
    return [data.join(separator)];
  }
}

/**
 * Split block implementation
 * Divides a string into an array of substrings using a separator
 */
function applySplitBlock(data: any[], block: Block): any[] {
  console.log('Applying split block with config:', JSON.stringify(block.config));
  console.log('Input data first item:', data.length > 0 ? JSON.stringify(data[0]) : 'No data');
  
  return data.map(item => {
    // Deep clone the original item to prevent reference issues
    const result = JSON.parse(JSON.stringify(item));
    const field = block.config.field || '';
    
    // Get the value to split
    let valueToSplit = '';
    if (field) {
      const fieldValue = getNestedValue(item, field);
      if (fieldValue !== undefined) {
        valueToSplit = String(fieldValue);
        console.log(`Found field value "${field}":`, valueToSplit);
      } else {
        console.log(`Field "${field}" not found in item:`, JSON.stringify(item));
        return result; // Return unchanged if field not found
      }
    } else {
      valueToSplit = JSON.stringify(item);
    }
    
    console.log(`Value to split: "${valueToSplit}"`);
    
    // Determine how to split the value
    let splitResult: string[] = [];
    
    // Option 1: Split into individual characters
    if (block.config.splitCharacters) {
      splitResult = valueToSplit.split('');
      console.log('Split into characters:', splitResult);
    } 
    // Option 2: Split by whitespace (default case) - when separator is unspecified or empty
    else if (block.config.separator === undefined || block.config.separator === '') {
      splitResult = valueToSplit.trim().split(/\s+/);
      console.log('Split by whitespace:', splitResult);
    } 
    // Option 3: Split by specified separator
    else {
      console.log(`Using separator: "${block.config.separator}"`);
      splitResult = valueToSplit.split(block.config.separator);
      console.log('Split by separator:', splitResult);
    }
    
    // Set the result back to the field
    if (field) {
      // Split the field path into parts
      const fieldParts = field.split('.');
      
      // Handle nested fields directly for better debugging
      if (fieldParts.length > 1) {
        let current = result;
        
        // Navigate to the parent object of the target field
        for (let i = 0; i < fieldParts.length - 1; i++) {
          const part = fieldParts[i];
          if (current[part] === undefined) {
            current[part] = {};
          }
          current = current[part];
        }
        
        // Set the value at the last level
        const lastPart = fieldParts[fieldParts.length - 1];
        current[lastPart] = splitResult;
        console.log(`Directly set nested field "${field}" to:`, splitResult);
      } else {
        // Use setNestedValue for simple fields
        result[field] = splitResult;
        console.log(`Set field "${field}" to:`, splitResult);
      }
      
      console.log('Result after setting value:', JSON.stringify(result));
      return result;
    } else {
      return splitResult;
    }
  });
}

/**
 * Unique block implementation
 * Creates a copy of an array where all duplicates are removed
 */
function applyUniqueBlock(data: any[], block: Block): any[] {
  console.log('Applying unique block with config:', JSON.stringify(block.config));
  console.log('Input data first item:', data.length > 0 ? JSON.stringify(data[0]) : 'No data');
  
  const field = block.config.field || '';
  const compareProperty = block.config.compareProperty || '';
  
  // Function to remove duplicates from array
  const uniqueArray = (arr: any[]): any[] => {
    // For primitives or when using a compare property, we can use a simpler approach
    if (arr.every(i => typeof i !== 'object' || i === null) || compareProperty) {
      if (compareProperty && arr.length > 0 && typeof arr[0] === 'object') {
        // Using a specific property for comparison with objects
        const seen = new Set();
        return arr.filter(item => {
          const compareValue = item[compareProperty];
          // Skip items that don't have the compare property
          if (compareValue === undefined) return true;
          
          // Use the property value for deduplication
          if (seen.has(compareValue)) {
            return false;
          }
          seen.add(compareValue);
          return true;
        });
      } else {
        // For primitives, use Set
        return Array.from(new Set(arr));
      }
    }
    
    // For objects without a compare property, we'll need to stringify to compare
    const seen = new Set();
    return arr.filter(item => {
      const itemStr = JSON.stringify(item);
      if (seen.has(itemStr)) {
        return false;
      }
      seen.add(itemStr);
      return true;
    });
  };
  
  // If field is specified, apply to that field
  if (field) {
    // First, get all the values from the specified field
    const fieldValues = data.map(item => getNestedValue(item, field));
    
    // If the field values are arrays, we need to handle them differently
    if (fieldValues.every(v => Array.isArray(v))) {
      return data.map(item => {
        const result = JSON.parse(JSON.stringify(item));
        const fieldValue = getNestedValue(item, field);
        
        if (Array.isArray(fieldValue)) {
          const uniqueValue = uniqueArray(fieldValue);
          setNestedValue(result, field, uniqueValue);
        }
        
        return result;
      });
    }
    
    // If the field values are objects, we need to handle them differently
    if (fieldValues.every(v => typeof v === 'object' && v !== null)) {
      // Create a map to track unique objects based on the compare property
      const seen = new Set();
      const uniqueItems = [];
      
      for (const item of data) {
        const fieldValue = getNestedValue(item, field);
        if (!fieldValue) continue;
        
        const compareValue = compareProperty ? fieldValue[compareProperty] : JSON.stringify(fieldValue);
        if (!seen.has(compareValue)) {
          seen.add(compareValue);
          uniqueItems.push(item);
        }
      }
      
      return uniqueItems;
    }
    
    // For other cases, just return the original data
    return data;
  } else {
    // If no field is specified, apply unique to the entire array
    return uniqueArray(data);
  }
}

/**
 * Limit block implementation
 * Creates a copy of an array cut off at the selected limit
 */
function applyLimitBlock(data: any[], block: Block): any[] {
  console.log('Applying limit block with config:', JSON.stringify(block.config));
  console.log('Input data first item:', data.length > 0 ? JSON.stringify(data[0]) : 'No data');
  
  const field = block.config.field || '';
  const limit = block.config.limit || 0;
  
  // If field is specified, apply to that field
  if (field) {
    return data.map(item => {
      // Deep clone the original item to prevent reference issues
      const result = JSON.parse(JSON.stringify(item));
      const fieldValue = getNestedValue(item, field);
      
      // Check if the value exists and is an array
      if (fieldValue !== undefined) {
        if (Array.isArray(fieldValue)) {
          // Apply limit to the array
          const limitedValue = fieldValue.slice(0, limit);
          
          // Set the limited array back to the field
          setNestedValue(result, field, limitedValue);
        } else {
          console.log(`Field "${field}" is not an array, skipping limit operation`);
        }
      } else {
        console.log(`Field "${field}" not found in item:`, JSON.stringify(item));
      }
      
      return result;
    });
  } else {
    // If no field is specified, apply limit to the entire array
    return data.slice(0, limit);
  }
}

const applyLengthBlock = (data: any[], block: Block): any[] => {
  const field = block.config.field || '';
  
  // If field is specified, get the value from that field
  if (field) {
    return data.map(item => {
      const target = getNestedValue(item, field);
      if (Array.isArray(target)) {
        return target.length;
      } else if (typeof target === "string") {
        return target.length;
      } else if (typeof target === "object" && target !== null) {
        return Object.keys(target).length;
      }
      return 0;
    });
  } else {
    // If no field is specified, return the total length of the array
    return [data.length];
  }
};

/**
 * Min block implementation
 * Finds the minimum value in a collection of data
 */
function applyMinBlock(data: any[], block: Block): any[] {
  const { field, minRecursive } = block.config;
  
  // Function to find minimum value in an array
  const findMinInArray = (arr: any[]): any => {
    if (arr.length === 0) return undefined;
    
    // Filter out non-numeric values and convert to numbers
    const numericValues = arr
      .map(val => {
        if (typeof val === 'string') {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }
        return typeof val === 'number' ? val : undefined;
      })
      .filter((val): val is number => val !== undefined);
    
    if (numericValues.length === 0) return undefined;
    return Math.min(...numericValues);
  };
  
  // Function to find minimum value in an object
  const findMinInObject = (obj: any, recursive: boolean): any => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return undefined;
    }
    
    const values = Object.values(obj);
    const minValues: number[] = [];
    
    // Process each value
    for (const value of values) {
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
        minValues.push(Number(value));
      } else if (recursive && value && typeof value === 'object' && !Array.isArray(value)) {
        const nestedMin = findMinInObject(value, true);
        if (nestedMin !== undefined) {
          minValues.push(nestedMin);
        }
      } else if (Array.isArray(value)) {
        const arrayMin = findMinInArray(value);
        if (arrayMin !== undefined) {
          minValues.push(arrayMin);
        }
      }
    }
    
    return minValues.length > 0 ? Math.min(...minValues) : undefined;
  };
  
  // If field is specified, get the value from that field
  if (field) {
    return data.map(item => {
      const target = getNestedValue(item, field);
      
      if (Array.isArray(target)) {
        return findMinInArray(target);
      } else if (target && typeof target === 'object') {
        return findMinInObject(target, !!minRecursive);
      } else if (typeof target === 'number' || (typeof target === 'string' && !isNaN(Number(target)))) {
        return Number(target);
      }
      return undefined;
    });
  } else {
    // If no field is specified, find minimum in the entire data
    if (Array.isArray(data)) {
      return [findMinInArray(data)];
    } else if (data && typeof data === 'object') {
      return [findMinInObject(data, !!minRecursive)];
    }
    return [undefined];
  }
}

function applyMaxBlock(data: any[], block: Block): any[] {
  const { field, maxRecursive } = block.config;
  
  // Function to find maximum value in an array
  const findMaxInArray = (arr: any[]): any => {
    if (arr.length === 0) return undefined;
    
    // Filter out non-numeric values and convert to numbers
    const numericValues = arr
      .map(val => {
        if (typeof val === 'string') {
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }
        return typeof val === 'number' ? val : undefined;
      })
      .filter((val): val is number => val !== undefined);
    
    if (numericValues.length === 0) return undefined;
    return Math.max(...numericValues);
  };
  
  // Function to find maximum value in an object
  const findMaxInObject = (obj: any, recursive: boolean): any => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return undefined;
    }
    
    const values = Object.values(obj);
    const maxValues: number[] = [];
    
    // Process each value
    for (const value of values) {
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
        maxValues.push(Number(value));
      } else if (recursive && value && typeof value === 'object' && !Array.isArray(value)) {
        const nestedMax = findMaxInObject(value, true);
        if (nestedMax !== undefined) {
          maxValues.push(nestedMax);
        }
      } else if (Array.isArray(value)) {
        const arrayMax = findMaxInArray(value);
        if (arrayMax !== undefined) {
          maxValues.push(arrayMax);
        }
      }
    }
    
    return maxValues.length > 0 ? Math.max(...maxValues) : undefined;
  };
  
  // If field is specified, get the value from that field
  if (field) {
    return data.map(item => {
      const target = getNestedValue(item, field);
      
      if (Array.isArray(target)) {
        return findMaxInArray(target);
      } else if (target && typeof target === 'object') {
        return findMaxInObject(target, !!maxRecursive);
      } else if (typeof target === 'number' || (typeof target === 'string' && !isNaN(Number(target)))) {
        return Number(target);
      }
      return undefined;
    });
  } else {
    // If no field is specified, find maximum in the entire data
    if (Array.isArray(data)) {
      return [findMaxInArray(data)];
    } else if (data && typeof data === 'object') {
      return [findMaxInObject(data, !!maxRecursive)];
    }
    return [undefined];
  }
}