import React, { useState, ChangeEvent, useMemo } from 'react';
import { Block, BlockType } from '../types';
import FieldSelector from '../../common/FieldSelector';

interface ValidateBlockProps {
  block: Block;
  onChange: (updatedBlock: Block) => void;
  allFields: string[];
  context?: Record<string, any[]>;
  inputFileName?: string;
  blocks?: Block[];
}

const ValidateBlock: React.FC<ValidateBlockProps> = ({ block, onChange, allFields, context, inputFileName, blocks }) => {
  const [newRule, setNewRule] = useState({ field: '', rule: '', errorMessage: '' });
  const [selectedStep, setSelectedStep] = useState('');

  const availableSteps = useMemo(() => {
    if (!blocks || !context) return [];
    
    const currentBlockIndex = blocks.findIndex(b => b.id === block.id);
    if (currentBlockIndex === -1) return [];
    
    const previousSteps = blocks
      .slice(0, currentBlockIndex)
      .map(b => b.outputName)
      .filter(Boolean);
    
    return [
      ...(inputFileName ? ['raw_data'] : []),
      ...previousSteps
    ];
  }, [blocks, block.id, context, inputFileName]);

  const handleChange = (field: keyof typeof block.config, value: any) => {
    if (field === 'validationType') {
      onChange({
        ...block,
        config: {
          ...block.config,
          validationType: value,
          schema: undefined,
          rules: undefined,
          typeCheck: undefined,
          field: undefined,
          pattern: undefined,
          flags: undefined,
          min: undefined,
          max: undefined,
          transform: undefined,
        },
      });
    } else {
      onChange({
        ...block,
        config: {
          ...block.config,
          [field]: value,
        },
      });
    }
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    handleChange(e.target.name as keyof typeof block.config, e.target.value);
  };

  const addRule = () => {
    if (!newRule.field || !newRule.rule) return;
    
    const rules = block.config.rules || [];
    onChange({
      ...block,
      config: {
        ...block.config,
        rules: [...rules, newRule],
      },
    });
    
    setNewRule({ field: '', rule: '', errorMessage: '' });
  };

  const removeRule = (index: number) => {
    const rules = [...(block.config.rules || [])];
    rules.splice(index, 1);
    
    onChange({
      ...block,
      config: {
        ...block.config,
        rules,
      },
    });
  };

  const generateSchemaFromData = (data: any[]): string => {
    if (!data || data.length === 0) return '';

    const sampleObject = data[0];
    const schema: any = {
      type: 'object',
      required: [],
      properties: {}
    };

    const analyzeValue = (value: any): any => {
      if (value === null) return { type: 'null' };
      if (Array.isArray(value)) {
        const arraySchema = {
          type: 'array',
          items: { type: 'any' }
        };
        if (value.length > 0) {
          arraySchema.items = analyzeValue(value[0]);
        }
        return arraySchema;
      }
      if (typeof value === 'object') {
        const objSchema = {
          type: 'object',
          required: [] as string[],
          properties: {} as Record<string, any>
        };
        Object.entries(value).forEach(([key, val]) => {
          objSchema.required.push(key);
          objSchema.properties[key] = analyzeValue(val);
        });
        return objSchema;
      }
      return { type: typeof value };
    };

    Object.entries(sampleObject).forEach(([key, value]) => {
      schema.required.push(key);
      schema.properties[key] = analyzeValue(value);
    });

    return JSON.stringify(schema, null, 2);
  };

  const handleGenerateSchema = () => {
    if (!selectedStep || !context || !context[selectedStep]) return;
    
    const generatedSchema = generateSchemaFromData(context[selectedStep]);
    handleChange('schema', generatedSchema);
  };

  const validationTypes = [
    { value: 'schema', label: 'JSON Schema' },
    { value: 'rule', label: 'Validation Rules' },
    { value: 'type', label: 'Type Checking' },
    { value: 'required', label: 'Required Fields' },
    { value: 'pattern', label: 'Pattern Matching' },
    { value: 'range', label: 'Value Range' },
    { value: 'custom', label: 'Custom Validation' },
  ];

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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "4px",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "12px", minWidth: "80px" }}>Validation Type</label>
          <select
            value={block.config.validationType || 'rule'}
            onChange={(e) => handleChange('validationType', e.target.value)}
            style={{
              width: "140px",
              minWidth: "140px",
              height: "20px",
              padding: "0px 4px",
              fontSize: "12px",
            }}
          >
            {validationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} {block.config.validationType === type.value ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {block.config.validationType === 'schema' && (
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
            <label style={{ fontSize: "12px", minWidth: "80px" }}>Generate from Step</label>
            <select
              value={selectedStep}
              onChange={(e) => setSelectedStep(e.target.value)}
              style={{
                width: "140px",
                minWidth: "140px",
                height: "20px",
                padding: "0px 4px",
                fontSize: "12px",
              }}
            >
              <option value="">Select a step...</option>
              {availableSteps.map(stepName => (
                <option key={stepName} value={stepName}>
                  {stepName === 'raw_data' && inputFileName ? inputFileName : stepName}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateSchema}
              disabled={!selectedStep}
              style={{
                padding: '2px 6px',
                fontSize: '11px',
                height: '20px',
                border: '1px solid #ccc',
                backgroundColor: selectedStep ? '#f3f4f6' : '#e5e7eb',
                cursor: selectedStep ? 'pointer' : 'not-allowed',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              Generate Schema
            </button>
          </div>

          <label style={{ fontSize: "12px" }}>JSON Schema</label>
          <textarea
            value={block.config.schema || ''}
            onChange={(e) => handleChange('schema', e.target.value)}
            placeholder="Enter a valid JSON Schema or generate one from a step"
            rows={8}
            style={{
              width: "80%",
              fontFamily: "monospace",
              fontSize: "12px",
              padding: "8px",
              resize: "none",
            }}
          />
        </div>
      )}

      {block.config.validationType === 'rule' && (
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
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {(block.config.rules || []).map((rule, index) => (
              <div 
                key={index} 
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ fontSize: "12px" }}>Field: <strong>{rule.field}</strong></div>
                  <div style={{ fontSize: "12px" }}>Rule: <strong>{rule.rule}</strong></div>
                  {rule.errorMessage && <div style={{ fontSize: "12px" }}>Error: {rule.errorMessage}</div>}
                </div>
                <button 
                  onClick={() => removeRule(index)}
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
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0px",
            }}
          >
            <label style={{ fontSize: "12px", fontWeight: "500" }}>Add New Rule</label>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flex: 1,
                }}
              >
                <FieldSelector
                  value={newRule.field}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewRule({ ...newRule, field: e.target.value })}
                  allFields={allFields}
                  placeholder="Select Field"
                  name="field"
                  inputData={null}
                />

                <input
                  value={newRule.rule}
                  onChange={(e) => setNewRule({ ...newRule, rule: e.target.value })}
                  placeholder="Validation rule (e.g., required, >10, isEmail)"
                  style={{
                    width: "80%",
                    height: "20px",
                    padding: "0px 8px",
                    fontSize: "12px",
                  }}
                />

                <input
                  value={newRule.errorMessage}
                  onChange={(e) => setNewRule({ ...newRule, errorMessage: e.target.value })}
                  placeholder="Custom error message (optional)"
                  style={{
                    width: "80%",
                    height: "20px",
                    padding: "0px 8px",
                    fontSize: "12px",
                  }}
                />
              </div>
              <button 
                onClick={addRule} 
                style={{
                  padding: '2px 6px',
                  fontSize: '11px',
                  height: '20px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f3f4f6',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                  marginTop: '4px',
                  marginRight: '8px',
                }}
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {block.config.validationType === 'type' && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label style={{ fontSize: "12px" }}>Type Expression</label>
          <input
            value={block.config.typeCheck || ''}
            onChange={(e) => handleChange('typeCheck', e.target.value)}
            placeholder="e.g., item => typeof item === 'string'"
            style={{
              width: "80%",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          />
        </div>
      )}

      {block.config.validationType === 'required' && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <label style={{ fontSize: "12px" }}>Required Fields</label>
          <FieldSelector
            value=""
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              const rules = block.config.rules || [];
              const field = e.target.value;
              if (field && !rules.some(r => r.field === field && r.rule === 'required')) {
                onChange({
                  ...block,
                  config: {
                    ...block.config,
                    rules: [...rules, { field, rule: 'required', errorMessage: `${field} is required` }],
                  },
                });
              }
            }}
            allFields={allFields}
            placeholder="Select field to add"
            name="requiredField"
            inputData={null}
          />
          
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {(block.config.rules || [])
              .filter(rule => rule.rule === 'required')
              .map((rule, index) => (
                <div 
                  key={index} 
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 8px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "12px" }}>{rule.field}</span>
                    {rule.errorMessage && (
                      <span style={{ fontSize: "11px", color: "#666" }}>{rule.errorMessage}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => removeRule(index)}
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
              ))
            }
          </div>
        </div>
      )}

      {block.config.validationType === 'pattern' && (
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
              gap: "4px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "80px" }}>Pattern Field</label>
            <FieldSelector
              value={block.config.field || ''}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange('field', e.target.value)}
              allFields={allFields}
              placeholder="Select field"
              name="field"
              inputData={null}
            />
          </div>
          
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "4px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "80px" }}>Regex Pattern</label>
            <input
              value={block.config.pattern || ''}
              onChange={(e) => handleChange('pattern', e.target.value)}
              placeholder="e.g., ^[a-zA-Z0-9]+$"
              style={{
                width: "100%",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
          
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "4px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "80px" }}>Flags</label>
            <input
              value={block.config.flags || ''}
              onChange={(e) => handleChange('flags', e.target.value)}
              placeholder="e.g., gi"
              style={{
                width: "100px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
        </div>
      )}

      {block.config.validationType === 'range' && (
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
              gap: "4px",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "12px", minWidth: "40px" }}>Field</label>
            <FieldSelector
              value={block.config.field || ''}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange('field', e.target.value)}
              allFields={allFields}
              placeholder="Select field"
              name="field"
              inputData={null}
            />
          </div>
          
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "4px",
                alignItems: "center",
              }}
            >
              <label style={{ fontSize: "12px", minWidth: "60px" }}>Min Value</label>
              <input
                value={block.config.min || ''}
                onChange={(e) => handleChange('min', e.target.value)}
                type="number"
                style={{
                  width: "100px",
                  height: "20px",
                  padding: "0px 8px",
                  fontSize: "12px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "4px",
                alignItems: "center",
              }}
            >
              <label style={{ fontSize: "12px", minWidth: "60px" }}>Max Value</label>
              <input
                value={block.config.max || ''}
                onChange={(e) => handleChange('max', e.target.value)}
                type="number"
                style={{
                  width: "100px",
                  height: "20px",
                  padding: "0px 8px",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {block.config.validationType === 'custom' && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label style={{ fontSize: "12px" }}>Custom Validation Function</label>
          <textarea
            value={block.config.transform || ''}
            onChange={(e) => handleChange('transform', e.target.value)}
            placeholder="e.g., (item) => { return item.age > 18 ? true : 'Must be over 18'; }"
            rows={8}
            style={{
              width: "80%",
              fontFamily: "monospace",
              fontSize: "12px",
              padding: "8px",
              resize: "none",
            }}
          />
          <div style={{ fontSize: "11px", color: "#666" }}>
            Return true if valid, or an error string if invalid.
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginTop: "4px",
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
          <input
            type="checkbox"
            id={`failOnError-${block.id}`}
            checked={block.config.failOnError === true}
            onChange={(e) => handleChange('failOnError', e.target.checked)}
            style={{
              margin: 0,
              width: "14px",
              height: "14px",
            }}
          />
          <label htmlFor={`failOnError-${block.id}`} style={{ fontSize: "12px" }}>
            Filter out invalid items
          </label>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            id={`addValidationFields-${block.id}`}
            checked={block.config.addValidationFields === true}
            onChange={(e) => handleChange('addValidationFields', e.target.checked)}
            style={{
              margin: 0,
              width: "14px",
              height: "14px",
            }}
          />
          <label htmlFor={`addValidationFields-${block.id}`} style={{ fontSize: "12px" }}>
            Add validation results as fields to each item
          </label>
        </div>
      </div>
    </div>
  );
};

export default ValidateBlock; 