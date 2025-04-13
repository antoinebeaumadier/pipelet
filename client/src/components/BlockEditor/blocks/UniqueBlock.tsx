import React from 'react';
import { Block } from '../types';

interface UniqueBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  allFields: string[];
  inputData: any[] | null;
}

const UniqueBlock: React.FC<UniqueBlockProps> = ({ block, onChange, allFields, inputData }) => {
  // Get nested field suggestions based on input data
  const getFieldSuggestions = () => {
    if (!inputData || inputData.length === 0) return allFields;
    
    const sample = inputData[0];
    const suggestions = new Set<string>();
    
    // Add root element option
    suggestions.add("");
    
    const traverse = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        suggestions.add(path);
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          traverse(value, path);
        }
      });
    };
    
    traverse(sample);
    return Array.from(suggestions);
  };

  const fieldSuggestions = getFieldSuggestions();

  // Get property suggestions based on the selected field
  const getPropertySuggestions = () => {
    if (!inputData || inputData.length === 0) return [];
    
    const field = block.config.field || '';
    let targetObj = inputData[0];
    
    if (field) {
      // Get the object at the specified field path
      const fieldParts = field.split('.');
      for (const part of fieldParts) {
        if (targetObj && typeof targetObj === 'object') {
          targetObj = targetObj[part];
        } else {
          targetObj = null;
          break;
        }
      }
    }
    
    const suggestions = new Set<string>();
    suggestions.add(""); // Add empty string for object equality option
    
    // If the object is an array, get the properties of its first item
    if (Array.isArray(targetObj) && targetObj.length > 0) {
      const firstItem = targetObj[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        Object.keys(firstItem).forEach(key => {
          suggestions.add(key);
        });
      }
    }
    // If the object is not an array but is an object, get its properties
    else if (typeof targetObj === 'object' && targetObj !== null) {
      Object.keys(targetObj).forEach(key => {
        suggestions.add(key);
      });
    }
    
    return Array.from(suggestions);
  };

  const propertySuggestions = getPropertySuggestions();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "12px", minWidth: "40px" }}>
            Field:
          </label>
          <select
            name="field"
            value={block.config.field || ""}
            onChange={onChange}
            style={{
              width: "150px",
              minWidth: "150px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          >
            <option value="">Root object</option>
            {fieldSuggestions
              .filter(field => field !== "") // Filter out empty string since we manually added it above
              .sort()
              .map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "12px", minWidth: "120px" }}>
            Compare by property:
          </label>
          <select
            name="compareProperty"
            value={block.config.compareProperty || ""}
            onChange={onChange}
            style={{
              width: "150px",
              minWidth: "150px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          >
            <option value="">Object Equality</option>
            {propertySuggestions
              .filter(prop => prop !== "") 
              .sort()
              .map((prop) => (
                <option key={prop} value={prop}>
                  {prop}
                </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#666",
        }}
      >
        This block creates a new array with duplicate values removed. Select "Root object" to apply to the entire item.
        When working with objects, you can select a property to use for comparison.
      </div>
    </div>
  );
};

export default UniqueBlock; 