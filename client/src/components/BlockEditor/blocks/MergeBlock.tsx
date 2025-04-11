import React from 'react';
import { Block } from '../types';

interface MergeBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  availableInputs: string[];
  inputFileName: string | null;
  allFields: string[];
  inputData: any[] | null;
  mergeData: any[] | null;
}

const MergeBlock: React.FC<MergeBlockProps> = ({ 
  block, 
  onChange,
  availableInputs,
  inputFileName,
  allFields,
  inputData,
  mergeData
}) => {
  const getLeftFieldSuggestions = () => {
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

  const getRightFieldSuggestions = () => {
    if (!mergeData || mergeData.length === 0) return [];
    
    const sample = mergeData[0];
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

  const leftFieldSuggestions = getLeftFieldSuggestions();
  const rightFieldSuggestions = getRightFieldSuggestions();

  const handleMergeWithChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'mergeWith',
        value: e.target.value,
      },
    } as any);
  };

  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'mergeStrategy',
        value: e.target.value,
      },
    } as any);
  };

  const handleJoinTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'joinType',
        value: e.target.value,
      },
    } as any);
  };

  const handleLeftKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'leftKey',
        value: e.target.value,
      },
    } as any);
  };

  const handleRightKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'rightKey',
        value: e.target.value,
      },
    } as any);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap"
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
          <label style={{ fontSize: "12px", minWidth: "40px" }}>
            Merge with:
          </label>
          <select
            name="mergeWith"
            value={block.config.mergeWith || ""}
            onChange={handleMergeWithChange}
            style={{
              width: "120px",
              minWidth: "120px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          >
            <option value="">Select source</option>
            {availableInputs.map((input) => (
              <option key={input} value={input}>
                {input === "raw_data" && inputFileName
                  ? inputFileName
                  : input}
              </option>
            ))}
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
          <label style={{ fontSize: "12px", minWidth: "40px" }}>
            Strategy:
          </label>
          <select
            name="mergeStrategy"
            value={block.config.mergeStrategy || "combine"}
            onChange={handleStrategyChange}
            style={{
              width: "120px",
              minWidth: "120px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          >
            <option value="combine">Combine</option>
            <option value="override">Replace</option>
            <option value="append">Append</option>
          </select>
        </div>
      </div>

      {block.config.mergeStrategy === "override" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
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
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Join Type:
            </label>
            <select
              name="joinType"
              value={block.config.joinType || "inner"}
              onChange={handleJoinTypeChange}
              style={{
                width: "120px",
                minWidth: "120px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            >
              <option value="inner">Inner Join</option>
              <option value="left">Left Join</option>
              <option value="right">Right Join</option>
              <option value="full">Full Join</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap"
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
              <label style={{ fontSize: "12px", minWidth: "40px" }}>
                Left Key:
              </label>
              <select
                name="leftKey"
                value={block.config.leftKey || ""}
                onChange={handleLeftKeyChange}
                style={{
                  width: "120px",
                  minWidth: "120px",
                  height: "20px",
                  padding: "0px 8px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select field</option>
                {leftFieldSuggestions.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
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
              <label style={{ fontSize: "12px", minWidth: "40px" }}>
                Right Key:
              </label>
              <select
                name="rightKey"
                value={block.config.rightKey || ""}
                onChange={handleRightKeyChange}
                style={{
                  width: "120px",
                  minWidth: "120px",
                  height: "20px",
                  padding: "0px 8px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select field</option>
                {rightFieldSuggestions.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeBlock;