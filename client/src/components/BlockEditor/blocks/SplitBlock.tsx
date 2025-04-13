import React, { useEffect } from 'react';
import { Block } from '../types';

interface SplitBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  allFields: string[];
  inputData: any[] | null;
}

const SplitBlock: React.FC<SplitBlockProps> = ({ block, onChange, allFields, inputData }) => {
  // Debug the current block configuration
  useEffect(() => {
    console.log('SplitBlock component rendering with config:', JSON.stringify(block.config));
  }, [block.config]);

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

  // Handler for the split characters checkbox
  const handleSplitCharactersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const splitCharacters = e.target.checked;
    
    // Create a new change event to pass to the parent component
    onChange({
      target: {
        name: 'splitCharacters',
        value: splitCharacters,
      },
    } as any);
    
    console.log('Split characters checkbox changed to:', splitCharacters);
  };

  // Handler for the separator input field
  const handleSeparatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const separator = e.target.value;
    
    // Create a new change event to pass to the parent component
    onChange({
      target: {
        name: 'separator',
        value: separator,
      },
    } as any);
    
    console.log('Separator changed to:', separator);
  };

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
          <label style={{ fontSize: "12px", minWidth: "60px" }}>
            Separator:
          </label>
          <input
            type="text"
            name="separator"
            value={block.config.separator === undefined ? '' : block.config.separator}
            onChange={handleSeparatorChange}
            placeholder="Default (whitespace)"
            disabled={block.config.splitCharacters}
            style={{
              width: "150px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "4px",
          alignItems: "center",
          marginTop: "4px",
        }}
      >
        <input
          type="checkbox"
          id={`split-characters-${block.id}`}
          name="splitCharacters"
          checked={block.config.splitCharacters || false}
          onChange={handleSplitCharactersChange}
          style={{
            margin: 0,
            width: "14px",
            height: "14px",
          }}
        />
        <label
          htmlFor={`split-characters-${block.id}`}
          style={{ fontSize: "12px" }}
        >
          Split into individual characters
        </label>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#666",
          marginTop: "4px",
        }}
      >
        This block splits a string into an array of substrings. When no separator is provided, 
        the string is split by whitespace. Enable the checkbox to split the text into individual characters.
      </div>
    </div>
  );
};

export default SplitBlock; 