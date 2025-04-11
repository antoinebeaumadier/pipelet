/**
 * Functions for transforming values in the pipeline
 */

// Apply transformation to a value based on the transform type and options
export function transformValue(
    value: any,
    transform: string | undefined,
    option: string | undefined
  ): any {
    if (!transform) return value;
  
    // Initial conversion to ensure correct type
    let processedValue = value;
  
    switch (transform) {
      case "uppercase":
        return String(processedValue).toUpperCase();
  
      case "lowercase":
        return String(processedValue).toLowerCase();
  
      case "number":
        return Number(processedValue);
  
      case "string":
        return String(processedValue);
  
      case "round":
        if (isNaN(Number(processedValue))) return processedValue;
        const decimals = option ? parseInt(option) : 0;
        return Number(processedValue).toFixed(decimals);
  
      case "math":
        if (!option) return processedValue;
        if (isNaN(Number(processedValue))) return processedValue;
  
        try {
          // Safely evaluate the math expression
          // by replacing 'value' with the actual value
          const numericValue = Number(processedValue);
          const mathExpression = option.replace(
            /value/g,
            numericValue.toString()
          );
          // Note: eval is used here but in production code consider alternatives
          return eval(mathExpression);
        } catch (error) {
          console.error("Error in math expression:", error);
          return processedValue;
        }
  
      case "format":
        if (!option) return processedValue;
        // Replace {value} with the actual value
        return option.replace(/\{value\}/g, String(processedValue));
  
      case "extract":
        if (!option) return processedValue;
        const stringValue = String(processedValue);
  
        if (option.includes(":")) {
          // Format start:end to extract a substring
          const [start, end] = option.split(":").map((n) => parseInt(n));
          return stringValue.substring(start, end);
        } else {
          // Format index to extract a specific character
          const index = parseInt(option);
          return stringValue.charAt(index);
        }
  
      default:
        return processedValue;
    }
  }