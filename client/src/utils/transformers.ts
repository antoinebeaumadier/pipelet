/**
 * Functions for transforming values in the pipeline
 */

// Apply transformation to a value based on the transform type and options
export function transformValue(
  value: any,
  transform: string,
  transformOption?: string
): any {
  if (value === undefined || value === null) return value;

  switch (transform) {
    case "uppercase":
      return String(value).toUpperCase();
    case "lowercase":
      return String(value).toLowerCase();
    case "number":
      return Number(value);
    case "string":
      return String(value);
    case "keepOnly":
      // Just return the value as is - the filtering happens in applyMapBlock
      return value;
    case "round":
      const decimals = parseInt(transformOption || "0", 10);
      return Number(Number(value).toFixed(decimals));
    case "math":
      if (!transformOption) return value;
      try {
        const formula = transformOption.replace(/value/g, String(value));
        // eslint-disable-next-line no-eval
        return eval(formula);
      } catch (e) {
        console.error("Error evaluating math formula:", e);
        return value;
      }
    case "format":
      if (!transformOption) return value;
      return transformOption.replace(/\{value\}/g, String(value));
    case "extract":
      if (!transformOption) return value;
      try {
        const [start, end] = transformOption.split(":").map(Number);
        return String(value).slice(start, end);
      } catch (e) {
        console.error("Error extracting substring:", e);
        return value;
      }
    case "replicate":
      if (!transformOption) return value;
      try {
        const times = parseInt(transformOption, 10);
        if (times <= 1) return value;
        
        if (typeof value === 'string') {
          return value.repeat(times);
        }
        
        if (Array.isArray(value)) {
          return Array(times).fill(value).flat();
        }
        
        if (typeof value === 'object' && value !== null) {
          const result: Record<string, any> = {};
          for (const [key, val] of Object.entries(value)) {
            if (typeof val === 'string') {
              result[key] = val.repeat(times);
            } else if (Array.isArray(val)) {
              result[key] = Array(times).fill(val).flat();
            } else {
              result[key] = val;
            }
          }
          return result;
        }
        
        return value;
      } catch (e) {
        console.error("Error replicating value:", e);
        return value;
      }
    case "array-join":
      if (!Array.isArray(value)) return value;
      return value.join(transformOption || ", ");
    case "array-filter":
      if (!Array.isArray(value)) return value;
      try {
        const filterFn = new Function('item', 'index', 'array', `return ${transformOption}`) as (
          item: any,
          index: number,
          array: any[]
        ) => boolean;
        return value.filter(filterFn);
      } catch (e) {
        console.error("Error filtering array:", e);
        return value;
      }
    case "array-map":
      if (!Array.isArray(value)) return value;
      try {
        const mapFn = new Function('item', 'index', 'array', `return ${transformOption}`) as (
          item: any,
          index: number,
          array: any[]
        ) => any;
        return value.map(mapFn);
      } catch (e) {
        console.error("Error mapping array:", e);
        return value;
      }
    case "array-reduce":
      if (!Array.isArray(value)) return value;
      try {
        const reduceFn = new Function('acc', 'item', 'index', 'array', `return ${transformOption}`) as (
          acc: any,
          item: any,
          index: number,
          array: any[]
        ) => any;
        return value.reduce(reduceFn);
      } catch (e) {
        console.error("Error reducing array:", e);
        return value;
      }
    case "date-format":
      if (!transformOption) return value;
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;
        
        return transformOption
          .replace(/YYYY/g, date.getFullYear().toString())
          .replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'))
          .replace(/DD/g, String(date.getDate()).padStart(2, '0'))
          .replace(/HH/g, String(date.getHours()).padStart(2, '0'))
          .replace(/mm/g, String(date.getMinutes()).padStart(2, '0'))
          .replace(/ss/g, String(date.getSeconds()).padStart(2, '0'));
      } catch (e) {
        console.error("Error formatting date:", e);
        return value;
      }
    default:
      return value;
  }
}