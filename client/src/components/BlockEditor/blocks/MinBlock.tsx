import React from 'react';
import { Block } from '../types';

interface MinBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
  allFields: string[];
  inputData: any[] | null;
}

const MinBlock: React.FC<MinBlockProps> = ({ block, onChange, allFields, inputData }) => {
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
            gap: "4px",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            id={`minRecursive-${block.id}`}
            name="minRecursive"
            checked={block.config.minRecursive || false}
            onChange={(e) => {
              onChange({
                target: {
                  name: 'minRecursive',
                  value: e.target.checked,
                },
              } as any);
            }}
            style={{
              margin: 0,
              width: "14px",
              height: "14px",
            }}
          />
          <label
            htmlFor={`minRecursive-${block.id}`}
            style={{ fontSize: "12px" }}
          >
            Include nested values recursively
          </label>
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#666",
        }}
      >
        This block finds the minimum value in a collection. Select "Root object" to find the minimum value in the entire item.
        For objects, it will find the minimum value among all values. For arrays, it will find the minimum element.
      </div>
    </div>
  );
};

export default MinBlock; 