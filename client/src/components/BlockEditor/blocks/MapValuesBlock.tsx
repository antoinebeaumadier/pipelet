import React from 'react';
import { Block } from '../types';

interface MapValuesBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const MapValuesBlock: React.FC<MapValuesBlockProps> = ({ block, onChange }) => {
  const handleTransformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const transform = e.target.value;
    let valueCallback = '';
    
    switch (transform) {
      case 'multiply':
        valueCallback = '.value * 2';
        break;
      case 'divide':
        valueCallback = '.value / 2';
        break;
      case 'add':
        valueCallback = '.value + 10';
        break;
      case 'subtract':
        valueCallback = '.value - 10';
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
      case 'custom':
        valueCallback = block.config.valueCallback || '';
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
          name: 'valueCallback',
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
          <option value="multiply">Multiply by 2</option>
          <option value="divide">Divide by 2</option>
          <option value="add">Add 10</option>
          <option value="subtract">Subtract 10</option>
          <option value="stringify">Convert to String</option>
          <option value="number">Convert to Number</option>
          <option value="boolean">Convert to Boolean</option>
          <option value="custom">Custom Expression</option>
        </select>
      </div>

      {(block.config.transform === 'custom') && (
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
            name="valueCallback"
            placeholder="Enter JavaScript expression using .value"
            value={block.config.valueCallback || ""}
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
            Use <code>.value</code> to reference the original value
            <br />
            Examples:
            <br />
            <code>.value * 2</code> - Multiply by 2
            <br />
            <code>.value + 10</code> - Add 10
            <br />
            <code>String(.value)</code> - Convert to string
          </div>
        )}
      </div>
    </div>
  );
};

export default MapValuesBlock; 