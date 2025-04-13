import React, { useState, useEffect } from 'react';
import { Block, ArrayTemplateItem } from '../types';

interface CreateArrayBlockProps {
  block: Block;
  onChange: (block: Block) => void;
}

const CreateArrayBlock: React.FC<CreateArrayBlockProps> = ({ block, onChange }) => {
  const [arrayTemplate, setArrayTemplate] = useState<ArrayTemplateItem[]>(
    block.config.arrayTemplate || []
  );

  useEffect(() => {
    setArrayTemplate(block.config.arrayTemplate || []);
  }, [block.config.arrayTemplate]);

  const handleAddItem = () => {
    const newItem: ArrayTemplateItem = {
      value: ''
    };

    const updatedTemplate = [...arrayTemplate, newItem];
    setArrayTemplate(updatedTemplate);
    onChange({
      ...block,
      config: {
        ...block.config,
        arrayTemplate: updatedTemplate
      }
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedTemplate = [...arrayTemplate];
    updatedTemplate.splice(index, 1);
    setArrayTemplate(updatedTemplate);
    onChange({
      ...block,
      config: {
        ...block.config,
        arrayTemplate: updatedTemplate
      }
    });
  };

  const handleValueChange = (index: number, value: string) => {
    const updatedTemplate = [...arrayTemplate];
    updatedTemplate[index] = { ...updatedTemplate[index], value };
    setArrayTemplate(updatedTemplate);
    onChange({
      ...block,
      config: {
        ...block.config,
        arrayTemplate: updatedTemplate
      }
    });
  };

  return (
    <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: '8px',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        {arrayTemplate.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '4px', 
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <input
              type="text"
              placeholder="Value"
              value={item.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              style={{
                width: '120px',
                minWidth: '120px',
                height: '20px',
                padding: '0px 4px',
                fontSize: '12px',
                border: '1px solid #ccc',
                borderRadius: '2px',
                backgroundColor: 'white'
              }}
            />
            <button
              onClick={() => handleRemoveItem(index)}
              style={{
                padding: '2px 6px',
                fontSize: '11px',
                height: '20px',
                border: '1px solid #ccc',
                backgroundColor: 'white',
                cursor: 'pointer',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={handleAddItem}
          style={{
            padding: '2px 6px',
            fontSize: '11px',
            height: '20px',
            border: '1px solid #ccc',
            backgroundColor: '#f3f4f6',
            cursor: 'pointer',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          + Add Item
        </button>
      </div>
      <div
        style={{
          fontSize: '11px',
          color: '#666',
          marginTop: '8px',
        }}
      >
        Reference syntax: (1) "$input.field" maps field across all input items, (2) "$input[0].field" accesses a specific item, (3) "$stepName.field" or "$stepName[index].field" for other steps.
      </div>
    </div>
  );
};

export default CreateArrayBlock; 