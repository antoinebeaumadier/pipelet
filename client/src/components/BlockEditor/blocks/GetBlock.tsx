import React from 'react';
import { Block } from '../types';

interface GetBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
  allFields: string[];
  inputData: any[] | null;
}

const GetBlock: React.FC<GetBlockProps> = ({ block, onChange, allFields, inputData }) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ minWidth: '60px', fontSize: '12px' }}>Path:</label>
        <select
          name="path"
          value={block.config.path || ''}
          onChange={onChange}
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
      </div>
      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
        Use dot notation to access nested properties (e.g. .address.city)
      </div>
    </div>
  );
};

export default GetBlock; 