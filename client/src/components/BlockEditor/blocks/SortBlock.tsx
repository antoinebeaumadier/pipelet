import React from 'react';
import { Block } from '../types';

interface SortBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const SortBlock: React.FC<SortBlockProps> = ({ block, onChange, allFields, inputData }) => {
  // Get nested field suggestions based on input data
  const getFieldSuggestions = () => {
    if (!inputData || inputData.length === 0) return allFields;
    
    const sample = inputData[0];
    const suggestions = new Set<string>();
    
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

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'field',
        value: e.target.value,
      },
    } as any);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'operator',
        value: e.target.value,
      },
    } as any);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <label style={{ fontSize: "12px" }}>
          Field:
        </label>
        <select
          name="field"
          value={block.config.field || ""}
          onChange={handleFieldChange}
          style={{
            width: "120px",
            minWidth: "120px",
            height: "20px",
            padding: "0px 8px",
            fontSize: "12px",
          }}
        >
          <option value="">Select field</option>
          {fieldSuggestions.map((field) => (
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
          flexWrap: "nowrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <label style={{ fontSize: "12px" }}>
          Order:
        </label>
        <select
          name="operator"
          value={block.config.operator || ""}
          onChange={handleOrderChange}
          style={{
            width: "100px",
            minWidth: "100px",
            height: "20px",
            padding: "0px 8px",
            fontSize: "12px",
          }}
        >
          <option value="">Choose</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
};

export default SortBlock;