import React, { useState } from 'react';
import { Block } from '../types';

interface GroupByBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const GroupByBlock: React.FC<GroupByBlockProps> = ({ block, onChange, allFields, inputData }) => {
  const [aggregateFields, setAggregateFields] = useState(
    block.config.aggregateFields || [{ field: '', operation: 'sum', newField: '' }]
  );

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

  const handleAddAggregateField = () => {
    setAggregateFields([...aggregateFields, { field: '', operation: 'sum', newField: '' }]);
  };

  const handleRemoveAggregateField = (index: number) => {
    const newFields = aggregateFields.filter((_, i) => i !== index);
    setAggregateFields(newFields);
    onChange({
      target: {
        name: 'aggregateFields',
        value: newFields,
      },
    } as any);
  };

  const handleAggregateFieldChange = (index: number, field: string, value: string) => {
    const newFields = [...aggregateFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setAggregateFields(newFields);
    onChange({
      target: {
        name: 'aggregateFields',
        value: newFields,
      },
    } as any);
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'groupBy',
        value: e.target.value,
      },
    } as any);
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
          flexWrap: "nowrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <label style={{ fontSize: "12px" }}>
          Group by:
        </label>
        <select
          name="groupBy"
          value={block.config.groupBy || ''}
          onChange={handleGroupByChange}
          style={{
            width: "120px",
            minWidth: "120px",
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
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "12px" }}>
            Aggregate (optional):
          </label>
          <button
            onClick={handleAddAggregateField}
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
            +
          </button>
        </div>

        {aggregateFields.map((field, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <select
              value={field.field}
              onChange={(e) => handleAggregateFieldChange(index, 'field', e.target.value)}
              style={{
                width: "120px",
                minWidth: "120px",
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
            <select
              value={field.operation}
              onChange={(e) => handleAggregateFieldChange(index, 'operation', e.target.value)}
              style={{
                width: "80px",
                minWidth: "80px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            >
              <option value="sum">Sum</option>
              <option value="average">Avg</option>
              <option value="count">Count</option>
              <option value="min">Min</option>
              <option value="max">Max</option>
            </select>
            <input
              type="text"
              placeholder="New name"
              value={field.newField}
              onChange={(e) => handleAggregateFieldChange(index, 'newField', e.target.value)}
              style={{
                width: "100px",
                minWidth: "100px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
            <button
              onClick={() => handleRemoveAggregateField(index)}
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

export default GroupByBlock; 