import React from 'react';
import { Block } from '../types';

interface MapBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const MapBlock: React.FC<MapBlockProps> = ({ block, onChange, allFields, inputData }) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onChange({
      target: {
        name,
        value: checked,
      },
    } as any);
  };

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
        gap: "16px",
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
              width: "100px",
              minWidth: "50px",
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
            New Field:
          </label>
          <input
            name="newField"
            placeholder="Ex: new_field"
            value={block.config.newField || ""}
            onChange={onChange}
            style={{
              width: "100px",
              minWidth: "100px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          />
          {block.config.newField && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "4px",
                alignItems: "center",
                marginLeft: "8px"
              }}
            >
              <input
                type="checkbox"
                id={`keepNested-${block.id}`}
                name="keepNestedStructure"
                checked={block.config.keepNestedStructure || false}
                onChange={handleCheckboxChange}
                style={{
                  margin: 0,
                  width: "14px",
                  height: "14px",
                }}
              />
              <label
                htmlFor={`keepNested-${block.id}`}
                style={{ fontSize: "12px" }}
              >
                Keep nested
              </label>
            </div>
          )}
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
            Transform:
          </label>
          <select
            name="transform"
            value={block.config.transform || ""}
            onChange={onChange}
            style={{
              width: "100px",
              minWidth: "150px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          >
            <option value="">None</option>
            <option value="keepOnly">Keep only this field</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="number">Number</option>
            <option value="string">Text</option>
            <option value="round">Round</option>
            <option value="math">Math</option>
            <option value="format">Format</option>
            <option value="extract">Extract</option>
            <option value="replicate">Repeat</option>
            <option value="array-join">Array Join</option>
            <option value="array-filter">Array Filter</option>
            <option value="array-map">Array Map</option>
            <option value="array-reduce">Array Reduce</option>
            <option value="date-format">Date Format</option>
          </select>
        </div>

        {block.config.transform === "math" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Formula:
            </label>
            <input
              name="transformOption"
              placeholder="Ex: value * 2"
              value={block.config.transformOption || ""}
              onChange={onChange}
              style={{
                width: "120px",
                minWidth: "120px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        )}

        {block.config.transform === "format" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Format:
            </label>
            <input
              name="transformOption"
              placeholder="Ex: Price: {value} €"
              value={block.config.transformOption || ""}
              onChange={onChange}
              style={{
                width: "120px",
                minWidth: "120px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        )}

        {block.config.transform === "extract" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Extract:
            </label>
            <input
              name="transformOption"
              placeholder="Ex: 0:5"
              value={block.config.transformOption || ""}
              onChange={onChange}
              style={{
                width: "120px",
                minWidth: "120px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        )}

        {block.config.transform === "round" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Decimals:
            </label>
            <input
              name="transformOption"
              placeholder="Ex: 2"
              type="number"
              min="0"
              max="10"
              value={block.config.transformOption || ""}
              onChange={onChange}
              style={{
                width: "60px",
                minWidth: "60px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        )}

        {block.config.transform === "replicate" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Times:
            </label>
            <input
              name="transformOption"
              placeholder="Ex: 3"
              type="number"
              min="1"
              value={block.config.transformOption || ""}
              onChange={onChange}
              style={{
                width: "60px",
                minWidth: "60px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        )}

        {block.config.transform === "array-join" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Separator:
            </label>
            <input
              name="transformOption"
              placeholder="Ex: , "
              value={block.config.transformOption || ""}
              onChange={onChange}
              style={{
                width: "60px",
                minWidth: "60px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        )}

        {block.config.transform === "date-format" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Format:
            </label>
            <input
              name="transformOption"
              placeholder="Ex: YYYY-MM-DD"
              value={block.config.transformOption || ""}
              onChange={onChange}
              style={{
                width: "120px",
                minWidth: "120px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#666",
          marginTop: "0px",
        }}
      >
        {block.config.transform === "keepOnly" && (
          <div>
            This will create a new object containing only the selected field, removing all other fields.
          </div>
        )}
        
        {block.config.transform === "uppercase" && (
          <div>
            Converts text to UPPERCASE. Example: "hello" {'->'} "HELLO"
          </div>
        )}
        
        {block.config.transform === "lowercase" && (
          <div>
            Converts text to lowercase. Example: "HELLO" {'->'} "hello"
          </div>
        )}
        
        {block.config.transform === "number" && (
          <div>
            Converts value to a number. Example: "123" {'->'} 123
          </div>
        )}
        
        {block.config.transform === "string" && (
          <div>
            Converts value to text. Example: 123 {'->'} "123"
          </div>
        )}
        
        {block.config.transform === "round" && (
          <div>
            Rounds a number to specified decimal places. Example with 2 decimals: 3.14159 {'->'} 3.14
          </div>
        )}
        
        {block.config.transform === "math" && (
          <div>
            Performs math operations on the value. Use "value" variable in formula. Example: "value * 2" doubles the number.
          </div>
        )}
        
        {block.config.transform === "format" && (
          <div>
            Creates formatted text with value. Use {'{'}value{'}'} as placeholder. Example: "Price: {'{'}value{'}'} €" {'->'} "Price: 10 €"
          </div>
        )}
        
        {block.config.transform === "extract" && (
          <div>
            Extracts part of text using start:end syntax. Example: "0:5" on "Hello World" {'->'} "Hello"
          </div>
        )}
        
        {block.config.transform === "replicate" && (
          <div>
            Repeats value multiple times. Example with 3: "abc" {'->'} "abcabcabc"
          </div>
        )}
        
        {block.config.transform === "array-join" && (
          <div>
            Joins array elements into text. Specify separator. Example with ", ": [1,2,3] {'->'} "1, 2, 3"
          </div>
        )}
        
        {block.config.transform === "array-filter" && (
          <div>
            Filters array elements. Use "item" variable in condition. Example: "item {'>'} 2" keeps only values {'>'} 2.
          </div>
        )}
        
        {block.config.transform === "array-map" && (
          <div>
            Transforms each array element. Use "item" variable. Example: "item * 2" doubles each element.
          </div>
        )}
        
        {block.config.transform === "array-reduce" && (
          <div>
            Combines array elements into single value. Use "acc" (accumulator) and "item". Example: "acc + item" sums all elements.
          </div>
        )}
        
        {block.config.transform === "date-format" && (
          <div>
            Formats date strings. Use YYYY (year), MM (month), DD (day), HH (hour), mm (minute), ss (second).
          </div>
        )}
      </div>
    </div>
  );
};

export default MapBlock;