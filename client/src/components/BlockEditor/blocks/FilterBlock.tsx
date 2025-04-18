import React from 'react';
import { Block } from '../types';

interface FilterBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
}

const FilterBlock: React.FC<FilterBlockProps> = ({ block, onChange, allFields, inputData }) => {
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
            gap: "8px",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "12px", minWidth: "40px" }}>
            Operator:
          </label>
          <select
            name="operator"
            value={block.config.operator || ""}
            onChange={onChange}
            style={{
              width: "100px",
              minWidth: "100px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">{">"}</option>
            <option value="<">{"<"}</option>
            <option value=">=">{">="}</option>
            <option value="<=">{"<="}</option>
            <option value="contains">contains</option>
            <option value="not_contains">not contains</option>
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
          <label style={{ fontSize: "12px", minWidth: "40px" }}>
            Value:
          </label>
          <input
            name="value"
            placeholder="Ex: {name} or $stepName.field or $input[0].field"
            value={block.config.value || ""}
            onChange={onChange}
            style={{
              width: "300px",
              minWidth: "300px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          />
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#666",
        }}
      >
        <div>
          Use {'{'}field{'}'} to reference fields from the current item. Example: {'{'}name{'}'} {'->'} "John"
        </div>
        <div style={{ marginTop: "4px" }}>
          Reference syntax: (0) {'{'}field{'}'} to access a field from the current block's input item, (1) "$input.field" to access a field across the file items (first step), (2) "$input[0].field" to access a specific file item, (3) "$stepName.field" or "$stepName[index].field" for other steps.
        </div>
      </div>
    </div>
  );
};

export default FilterBlock;