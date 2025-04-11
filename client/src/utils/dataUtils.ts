/**
 * Functions for data field extraction and manipulation
 */

// Function to extract all fields, including nested fields
export function extractAllFields(data: any[]): string[] {
    if (!data || data.length === 0) return [];
  
    const fields = new Set<string>();
  
    function extractFieldsFromObject(obj: any, prefix = "") {
      if (!obj || typeof obj !== "object") return;
  
      Object.keys(obj).forEach((key) => {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        fields.add(fieldPath);
  
        // Recursion for nested objects
        if (
          obj[key] &&
          typeof obj[key] === "object" &&
          !Array.isArray(obj[key])
        ) {
          extractFieldsFromObject(obj[key], fieldPath);
        }
      });
    }
  
    // Extract fields from the first object (sufficient for preview)
    extractFieldsFromObject(data[0]);
  
    // Convert to array and sort alphabetically
    return Array.from(fields).sort((a, b) => a.localeCompare(b));
  }
  
  // Function to get nested fields of a specific field
  export function getNestedFields(data: any[], parentField: string): string[] {
    if (!data || data.length === 0 || !parentField) return [];
  
    const nestedFields = new Set<string>();
    const firstItem = data[0];
    const parentValue = getNestedValue(firstItem, parentField);
  
    if (
      parentValue &&
      typeof parentValue === "object" &&
      !Array.isArray(parentValue)
    ) {
      Object.keys(parentValue).forEach((key) => {
        nestedFields.add(`${parentField}.${key}`);
      });
    }
  
    // Convert to array and sort alphabetically
    return Array.from(nestedFields);
  }
  
  // Get a value from an object using a path string (e.g., "user.address.city")
  export function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }
  
  // Set a value in a nested object structure
  export function setNestedValue(obj: any, path: string, value: any): void {
    const pathParts = path.split(".");
    let current = obj;
  
    // Navigate through the path except the last element
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
  
      // If the path doesn't exist, create an empty object
      if (current[part] === undefined) {
        current[part] = {};
      }
  
      current = current[part];
    }
  
    // Set the value at the last level
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;
  }
  
  // Parse CSV content into an array of objects
  export function parseCSV(content: string): any[] {
    const [headerLine, ...lines] = content
      .split(/\r?\n/)
      .filter((line) => line.trim());
    
    const headers = headerLine.split(",");
    
    return lines.map((line) => {
      const values = line.split(",");
      return headers.reduce((obj, key, i) => {
        obj[key] = values[i];
        return obj;
      }, {} as Record<string, string>);
    });
  }