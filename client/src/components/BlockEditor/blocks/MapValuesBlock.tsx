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
            name="valueCallback"
            placeholder="Enter JavaScript expression using .value"
            value={block.config.valueCallback || ""}
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
        Use <code>.value</code> to reference the original value
        <br />
        Examples:
        <br />
        <code>.value.toFixed(2)</code> - Format with 2 decimal places
        <br />
        <code>.value.replace(/pattern/, 'replacement')</code> - Replace text
        <br />
        <code>.value ? 'Yes' : 'No'</code> - Conditional values
        <br />
        <code>`.value + " units"`</code> - Append text
      </div>
    </div>
  );
};

export default MapValuesBlock; 