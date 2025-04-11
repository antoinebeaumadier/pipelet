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
  export function setNestedValue(obj: any, path: string, value: any): any {
    // Create a deep copy of the object
    const result = JSON.parse(JSON.stringify(obj));
    const pathParts = path.split(".");
    let current = result;
  
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
  
    return result;
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

  // Convert XML node to JSON-like structure
  function xmlToJson(node: Element): any {
    const obj: any = {};
    
    // Handle attributes
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        obj[`@${attr.name}`] = attr.value;
      }
    }

    // Handle child nodes
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = child as Element;
        const childName = childElement.tagName;
        
        if (!obj[childName]) {
          obj[childName] = xmlToJson(childElement);
        } else if (Array.isArray(obj[childName])) {
          obj[childName].push(xmlToJson(childElement));
        } else {
          obj[childName] = [obj[childName], xmlToJson(childElement)];
        }
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        obj["#text"] = child.textContent.trim();
      }
    }

    return obj;
  }

  // Parse XML content into an array of objects
  export function parseXML(content: string): any[] {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "text/xml");
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid XML format");
      }

      // Get the root element
      const root = xmlDoc.documentElement;
      const jsonData = xmlToJson(root);

      // If the root has a single child that's an array, return that array
      const rootKeys = Object.keys(jsonData);
      if (rootKeys.length === 1 && Array.isArray(jsonData[rootKeys[0]])) {
        return jsonData[rootKeys[0]];
      }

      // Otherwise return the root object in an array
      return [jsonData];
    } catch (error) {
      console.error("Error parsing XML:", error);
      throw error;
    }
  }