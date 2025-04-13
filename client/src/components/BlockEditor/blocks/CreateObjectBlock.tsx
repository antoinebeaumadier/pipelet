import React, { useState, useEffect } from 'react';
import { Block, ObjectTemplateItem } from '../types';

interface CreateObjectBlockProps {
  block: Block;
  onChange: (block: Block) => void;
}

const CreateObjectBlock: React.FC<CreateObjectBlockProps> = ({ block, onChange }) => {
  const [objectTemplate, setObjectTemplate] = useState<ObjectTemplateItem[]>(
    block.config.objectTemplate || []
  );

  useEffect(() => {
    setObjectTemplate(block.config.objectTemplate || []);
  }, [block.config.objectTemplate]);

  const handleAddProperty = (indices: number[] = []) => {
    const newProperty: ObjectTemplateItem = {
      key: '',
      value: '',
      isNested: false,
      children: []
    };

    let updatedTemplate = [...objectTemplate];
    
    if (indices.length > 0) {
      let current = updatedTemplate;
      // Traverse to the parent of where we want to add the new property
      for (let i = 0; i < indices.length - 1; i++) {
        if (!current[indices[i]]) {
          current[indices[i]] = { key: '', value: '', isNested: false, children: [] };
        }
        if (!current[indices[i]].children) {
          current[indices[i]].children = [];
        }
        current = current[indices[i]].children!;
      }
      
      // Ensure the parent exists and has a children array
      const parentIndex = indices[indices.length - 1];
      if (!current[parentIndex]) {
        current[parentIndex] = { key: '', value: '', isNested: false, children: [] };
      }
      if (!current[parentIndex].children) {
        current[parentIndex].children = [];
      }
      
      // Add the new property to the parent's children
      current[parentIndex].children!.push(newProperty);
    } else {
      updatedTemplate.push(newProperty);
    }

    setObjectTemplate(updatedTemplate);
    onChange({
      ...block,
      config: {
        ...block.config,
        objectTemplate: updatedTemplate
      }
    });
  };

  const handleRemoveProperty = (indices: number[]) => {
    let updatedTemplate = [...objectTemplate];
    
    if (indices.length > 0) {
      let current = updatedTemplate;
      for (let i = 0; i < indices.length - 1; i++) {
        current = current[indices[i]].children!;
      }
      current.splice(indices[indices.length - 1], 1);
    } else {
      updatedTemplate.splice(indices[0], 1);
    }

    setObjectTemplate(updatedTemplate);
    onChange({
      ...block,
      config: {
        ...block.config,
        objectTemplate: updatedTemplate
      }
    });
  };

  const handleToggleNested = (indices: number[]) => {
    let updatedTemplate = [...objectTemplate];
    let current = updatedTemplate;
    
    // Traverse to the parent of the target item
    for (let i = 0; i < indices.length - 1; i++) {
      if (!current[indices[i]]?.children) {
        current[indices[i]] = { ...current[indices[i]], children: [] };
      }
      current = current[indices[i]].children!;
    }
    
    // Update the target item
    const targetIndex = indices[indices.length - 1];
    if (current[targetIndex]) {
      const willBeNested = !current[targetIndex].isNested;
      current[targetIndex] = {
        ...current[targetIndex],
        isNested: willBeNested,
        // Clear the value if property becomes nested
        ...(willBeNested ? { value: '' } : {}),
        children: current[targetIndex].children || []
      };
    }

    setObjectTemplate(updatedTemplate);
    onChange({
      ...block,
      config: {
        ...block.config,
        objectTemplate: updatedTemplate
      }
    });
  };

  const handlePropertyChange = (indices: number[], field: 'key' | 'value', value: string) => {
    let updatedTemplate = [...objectTemplate];
    let current = updatedTemplate;
    
    // Traverse to the parent of the target item
    for (let i = 0; i < indices.length - 1; i++) {
      if (!current[indices[i]].children) {
        current[indices[i]].children = [];
      }
      current = current[indices[i]].children!;
    }
    
    // Update the target item
    const targetIndex = indices[indices.length - 1];
    if (current[targetIndex]) {
      current[targetIndex][field] = value;
    }

    setObjectTemplate(updatedTemplate);
    onChange({
      ...block,
      config: {
        ...block.config,
        objectTemplate: updatedTemplate
      }
    });
  };

  const renderProperty = (property: ObjectTemplateItem, indices: number[]) => {
    return (
      <div key={indices.join('-')} style={{ marginLeft: `${indices.length * 20}px`, maxWidth: '100%' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '4px', 
          alignItems: 'center', 
          marginBottom: '8px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Property name"
            value={property.key}
            onChange={(e) => handlePropertyChange(indices, 'key', e.target.value)}
            style={{
              width: '100px',
              minWidth: '100px',
              height: '20px',
              padding: '0px 4px',
              fontSize: '12px',
              border: '1px solid #ccc',
              borderRadius: '2px',
            }}
          />
          {!property.isNested && (
            <input
              type="text"
              placeholder="Value"
              value={property.value}
              onChange={(e) => handlePropertyChange(indices, 'value', e.target.value)}
              style={{
                width: '100px',
                minWidth: '100px',
                height: '20px',
                padding: '0px 4px',
                fontSize: '12px',
                border: '1px solid #ccc',
                borderRadius: '2px',
              }}
            />
          )}
          <button
            onClick={() => handleToggleNested(indices)}
            style={{
              padding: '2px 6px',
              fontSize: '11px',
              height: '20px',
              border: '1px solid #ccc',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            {property.isNested ? 'Remove Nested' : 'Add Nested'}
          </button>
          <button
            onClick={() => handleRemoveProperty(indices)}
            style={{
              padding: '2px 6px',
              fontSize: '11px',
              height: '20px',
              border: '1px solid #ccc',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            Remove
          </button>
        </div>
        
        {property.isNested && property.children && (
          <div style={{ marginLeft: '8px' }}>
            {property.children.map((child, childIndex) => 
              renderProperty(child, [...indices, childIndex])
            )}
            <button
              onClick={() => handleAddProperty([...indices, property.children!.length])}
              style={{
                padding: '2px 6px',
                fontSize: '11px',
                height: '20px',
                border: '1px solid #ccc',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
                marginBottom: '8px',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              Add Nested Property
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => handleAddProperty([])}
          style={{
            padding: '2px 6px',
            fontSize: '11px',
            height: '20px',
            border: '1px solid #ccc',
            backgroundColor: '#f3f4f6',
            cursor: 'pointer',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
          }}
        >
          Add Property
        </button>
      </div>
      <div style={{ maxWidth: '100%', overflow: 'auto' }}>
        {objectTemplate.map((property, index) => renderProperty(property, [index]))}
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

export default CreateObjectBlock; 