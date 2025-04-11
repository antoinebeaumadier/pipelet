import React, { useState } from 'react';
import { Block } from '../types';

interface PickBlockProps {
  block: Block;
  onChange: (block: Block) => void;
  allFields: string[];
  inputData: any[] | null;
}

const PickBlock: React.FC<PickBlockProps> = ({ block, onChange, allFields, inputData }) => {
  const [newProperty, setNewProperty] = useState('');

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

  const handleAddProperty = () => {
    if (!newProperty.trim()) return;
    
    const currentProperties = block.config.properties || [];
    if (!currentProperties.includes(newProperty)) {
      onChange({
        ...block,
        config: {
          ...block.config,
          properties: [...currentProperties, newProperty]
        }
      });
    }
    setNewProperty('');
  };

  const handleRemoveProperty = (property: string) => {
    const currentProperties = block.config.properties || [];
    onChange({
      ...block,
      config: {
        ...block.config,
        properties: currentProperties.filter(p => p !== property)
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select
          value={newProperty}
          onChange={(e) => setNewProperty(e.target.value)}
          style={{
            flex: 1,
            border: '1px solid #ccc',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            height: '24px',
          }}
        >
          <option value="">Select field</option>
          {fieldSuggestions.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddProperty}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: '#f3f4f6',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
        Use dot notation to access nested properties (e.g. .name or .address.city)
      </div>

      <div style={{
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {(block.config.properties || []).map((property) => (
          <div
            key={property}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
            }}
          >
            <span style={{ flex: 1, fontSize: "12px" }}>{property}</span>
            <button
              onClick={() => handleRemoveProperty(property)}
              style={{
                height: "20px",
                width: "20px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                backgroundColor: "#f9fafb",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PickBlock; 