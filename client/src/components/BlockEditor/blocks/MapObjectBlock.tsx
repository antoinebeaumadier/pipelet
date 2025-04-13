import React from 'react';
import { Block } from '../types';

interface MapObjectBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
}

const MapObjectBlock: React.FC<MapObjectBlockProps> = ({ block, onChange, allFields, inputData }) => {
  // Key transformations
  const handleKeyTransformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const transform = e.target.value;
    let keyCallback = '';
    
    switch (transform) {
      case 'uppercase':
        keyCallback = '.key.toUpperCase()';
        break;
      case 'lowercase':
        keyCallback = '.key.toLowerCase()';
        break;
      case 'capitalize':
        keyCallback = '.key.charAt(0).toUpperCase() + .key.slice(1)';
        break;
      case 'prefix':
        keyCallback = '"prefix_" + .key';
        break;
      case 'suffix':
        keyCallback = '.key + "_suffix"';
        break;
      case 'camelCase':
        keyCallback = '.key.replace(/(?:^|[-_])(\\w)/g, (_, c) => c.toUpperCase()).replace(/^\\w/, c => c.toLowerCase())';
        break;
      case 'pascalCase':
        keyCallback = '.key.replace(/(?:^|[-_])(\\w)/g, (_, c) => c.toUpperCase())';
        break;
      case 'snakeCase':
        keyCallback = '.key.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "")';
        break;
      case 'kebabCase':
        keyCallback = '.key.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")';
        break;
      case 'dotCase':
        keyCallback = '.key.replace(/([A-Z])/g, ".$1").toLowerCase().replace(/^\\./, "")';
        break;
      case 'trim':
        keyCallback = '.key.trim()';
        break;
      case 'removeSpaces':
        keyCallback = '.key.replace(/\\s+/g, "")';
        break;
      case 'slugify':
        keyCallback = '.key.toLowerCase().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "")';
        break;
      case 'capitalize_words':
        keyCallback = '.key.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")';
        break;
      case 'abbreviate':
        keyCallback = '.key.split(" ").map(word => word.charAt(0)).join("")';
        break;
      case 'reverse':
        keyCallback = '.key.split("").reverse().join("")';
        break;
      case 'hash':
        keyCallback = '"key_" + Math.abs(.key.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)).toString(36).substring(0, 6)';
        break;
      case 'custom':
        keyCallback = block.config.keyTransform || '.key';
        break;
      default:
        keyCallback = '.key';
    }

    // First update the transform value
    onChange({
      target: {
        name: 'transformOption',
        value: transform
      }
    } as React.ChangeEvent<HTMLInputElement>);

    // Then update the keyCallback if needed
    if (transform !== 'custom') {
      onChange({
        target: {
          name: 'keyTransform',
          value: keyCallback
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Value transformations
  const handleValueTransformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const transform = e.target.value;
    let valueCallback = '';
    
    switch (transform) {
      case 'multiply':
        valueCallback = '.value * 2';
        break;
      case 'double':
        valueCallback = '.value * 2';
        break;
      case 'triple':
        valueCallback = '.value * 3';
        break;
      case 'half':
        valueCallback = '.value / 2';
        break;
      case 'square':
        valueCallback = '.value * .value';
        break;
      case 'sqrt':
        valueCallback = 'Math.sqrt(.value)';
        break;
      case 'round':
        valueCallback = 'Math.round(.value)';
        break;
      case 'floor':
        valueCallback = 'Math.floor(.value)';
        break;
      case 'ceil':
        valueCallback = 'Math.ceil(.value)';
        break;
      case 'add10':
        valueCallback = '.value + 10';
        break;
      case 'add100':
        valueCallback = '.value + 100';
        break;
      case 'subtract10':
        valueCallback = '.value - 10';
        break;
      case 'negate':
        valueCallback = '-.value';
        break;
      case 'percentage':
        valueCallback = '.value * 100 + "%"';
        break;
      case 'stringify':
        valueCallback = 'String(.value)';
        break;
      case 'number':
        valueCallback = 'Number(.value)';
        break;
      case 'boolean':
        valueCallback = 'Boolean(.value)';
        break;
      case 'integer':
        valueCallback = 'parseInt(.value)';
        break;
      case 'float':
        valueCallback = 'parseFloat(.value)';
        break;
      case 'lowercase':
        valueCallback = '.value.toLowerCase()';
        break;
      case 'uppercase':
        valueCallback = '.value.toUpperCase()';
        break;
      case 'capitalize':
        valueCallback = '.value.charAt(0).toUpperCase() + .value.slice(1)';
        break;
      case 'trim':
        valueCallback = '.value.trim()';
        break;
      case 'abs':
        valueCallback = 'Math.abs(.value)';
        break;
      case 'date':
        valueCallback = 'new Date(.value).toISOString()';
        break;
      case 'currency':
        valueCallback = 'new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(.value)';
        break;
      case 'custom':
        valueCallback = block.config.valueTransform || '.value';
        break;
      default:
        valueCallback = '.value';
    }

    // First update the transform value
    onChange({
      target: {
        name: 'transform',
        value: transform
      }
    } as React.ChangeEvent<HTMLInputElement>);

    // Then update the valueCallback if needed
    if (transform !== 'custom') {
      onChange({
        target: {
          name: 'valueTransform',
          value: valueCallback
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Key Transform Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0px",
          border: "1px solid #eee",
          padding: "8px",
          borderRadius: "4px",
        }}
      >
        <h4 style={{ fontSize: "13px", margin: "0 0 8px 0" }}>Key Transformation</h4>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            alignItems: "flex-start",
            flexWrap: "wrap",
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
            <label style={{ fontSize: "12px", minWidth: "60px" }}>
              Transform:
            </label>
            <select
              name="transformOption"
              value={block.config.transformOption || ""}
              onChange={handleKeyTransformChange}
              style={{
                width: "240px",
                minWidth: "240px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            >
              <option value="">None</option>
              <optgroup label="Case Transformations">
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize First Letter</option>
                <option value="capitalize_words">Capitalize Each Word</option>
              </optgroup>
              <optgroup label="Naming Conventions">
                <option value="camelCase">camelCase</option>
                <option value="pascalCase">PascalCase</option>
                <option value="snakeCase">snake_case</option>
                <option value="kebabCase">kebab-case</option>
                <option value="dotCase">dot.case</option>
              </optgroup>
              <optgroup label="Additions">
                <option value="prefix">Add Prefix</option>
                <option value="suffix">Add Suffix</option>
              </optgroup>
              <optgroup label="Transformations">
                <option value="trim">Trim Whitespace</option>
                <option value="removeSpaces">Remove Spaces</option>
                <option value="slugify">Slugify</option>
                <option value="abbreviate">Abbreviate</option>
                <option value="reverse">Reverse</option>
                <option value="hash">Hash</option>
              </optgroup>
              <option value="custom">Custom Expression</option>
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
              Expression:
            </label>
            <input
              name="keyTransform"
              placeholder="Enter JavaScript expression using .key"
              value={block.config.keyTransform || ""}
              onChange={onChange}
              style={{
                width: "240px",
                minWidth: "240px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
          Use <code>.key</code> to reference the original key name
        </div>
      </div>

      {/* Value Transform Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          border: "1px solid #eee",
          padding: "8px",
          borderRadius: "4px",
        }}
      >
        <h4 style={{ fontSize: "13px", margin: "0 0 0 0" }}>Value Transformation</h4>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            alignItems: "flex-start",
            flexWrap: "wrap",
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
            <label style={{ fontSize: "12px", minWidth: "60px" }}>
              Transform:
            </label>
            <select
              name="transform"
              value={block.config.transform || ""}
              onChange={handleValueTransformChange}
              style={{
                width: "240px",
                minWidth: "240px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            >
              <option value="">None</option>
              <optgroup label="Numeric Operations">
                <option value="double">Double (× 2)</option>
                <option value="triple">Triple (× 3)</option>
                <option value="half">Half (÷ 2)</option>
                <option value="square">Square (n²)</option>
                <option value="sqrt">Square Root (√n)</option>
                <option value="round">Round</option>
                <option value="floor">Floor</option>
                <option value="ceil">Ceiling</option>
                <option value="add10">Add 10</option>
                <option value="add100">Add 100</option>
                <option value="subtract10">Subtract 10</option>
                <option value="negate">Negate (-n)</option>
                <option value="abs">Absolute Value (|n|)</option>
              </optgroup>
              <optgroup label="Type Conversions">
                <option value="stringify">To String</option>
                <option value="number">To Number</option>
                <option value="boolean">To Boolean</option>
                <option value="integer">To Integer</option>
                <option value="float">To Float</option>
              </optgroup>
              <optgroup label="Text Operations">
                <option value="lowercase">Lowercase</option>
                <option value="uppercase">Uppercase</option>
                <option value="capitalize">Capitalize</option>
                <option value="trim">Trim</option>
              </optgroup>
              <optgroup label="Formatting">
                <option value="percentage">To Percentage</option>
                <option value="currency">To Currency (USD)</option>
                <option value="date">To ISO Date</option>
              </optgroup>
              <option value="custom">Custom Expression</option>
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
              Expression:
            </label>
            <input
              name="valueTransform"
              placeholder="Enter JavaScript expression using .value"
              value={block.config.valueTransform || ""}
              onChange={onChange}
              style={{
                width: "240px",
                minWidth: "240px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: "10px", color: "#666", marginTop: "0px" }}>
          Use <code>.value</code> to reference the original value
        </div>
      </div>

      
    </div>
  );
};

export default MapObjectBlock; 