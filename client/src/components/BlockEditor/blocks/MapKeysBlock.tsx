import React from 'react';
import { Block } from '../types';

interface MapKeysBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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
      case 'prefix':
        keyCallback = '"prefix_" + .key';
        break;
      case 'suffix':
        keyCallback = '.key + "_suffix"';
        break;
      case 'camelCase':
        keyCallback = '.key.replace(/(?:^|_)(\\w)/g, (_, c) => c.toUpperCase())';
        break;
      case 'snakeCase':
        keyCallback = '.key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)';
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
            width: "120px",
            minWidth: "120px",
            height: "20px",
            padding: "0px 8px",
            fontSize: "12px",
          }}
        >
          <option value="">None</option>
          <option value="uppercase">Uppercase</option>
          <option value="lowercase">Lowercase</option>
          <option value="prefix">Add Prefix</option>
          <option value="suffix">Add Suffix</option>
          <option value="camelCase">Camel Case</option>
          <option value="snakeCase">Snake Case</option>
          <option value="custom">Custom Expression</option>
        </select>
      </div>

      {(block.config.transform === 'custom' || block.config.transform === 'prefix' || block.config.transform === 'suffix') && (
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
            placeholder={block.config.transform === 'custom' ? 'Enter JavaScript expression using .key' : 'Enter text'}
            value={block.config.keyCallback || ""}
            onChange={onChange}
            style={{
              width: "200px",
              minWidth: "200px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          />
        </div>
      )}

      <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
        {block.config.transform === 'custom' && (
          <div>
            Use <code>.key</code> to reference the original key name
            <br />
            Example: <code>"prefix_" + .key + "_suffix"</code>
          </div>
        )}
        {(block.config.transform === 'prefix' || block.config.transform === 'suffix') && (
          <div>
            Enter the text to add before/after each key
          </div>
        )}
      </div>
    </div>
  );
};

export default MapKeysBlock; 