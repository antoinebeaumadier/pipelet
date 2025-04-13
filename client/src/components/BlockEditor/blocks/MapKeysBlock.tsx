import React from 'react';
import { Block } from '../types';

interface MapKeysBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
}

const MapKeysBlock: React.FC<MapKeysBlockProps> = ({ block, onChange }) => {
  const handleTransformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        keyCallback = block.config.keyCallback || '';
        break;
      default:
        keyCallback = '.key';
    }

    // First update the transform value
    onChange({
      target: {
        name: 'transform',
        value: transform
      }
    } as React.ChangeEvent<HTMLInputElement>);

    // Then update the keyCallback if needed
    if (transform !== 'custom') {
      onChange({
        target: {
          name: 'keyCallback',
          value: keyCallback
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
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
            onChange={handleTransformChange}
            style={{
              width: "240px",
              minWidth: "240px",
              height: "24px",
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
            name="keyCallback"
            placeholder="Enter JavaScript expression using .key"
            value={block.config.keyCallback || ""}
            onChange={onChange}
            style={{
              width: "240px",
              minWidth: "240px",
              height: "24px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
        Use <code>.key</code> to reference the original key name
        <br />
        Examples:
        <br />
        <code>`.key.replace(/old/, 'new')`</code> - Replace text in keys
        <br />
        <code>`.key.substr(0, 10)`</code> - Truncate long key names
        <br />
        <code>`"my_" + .key`</code> - Add prefix to keys
        <br />
        <code>`.key.includes("temp") ? "temporary_" + .key : .key`</code> - Conditional renaming
      </div>
    </div>
  );
};

export default MapKeysBlock; 