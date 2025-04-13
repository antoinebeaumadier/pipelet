import React from 'react';
import { Block } from '../types';
import FieldSelector from '../../common/FieldSelector';

interface KeyByBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
  allFields: string[];
  inputData: any[] | null;
}

export const KeyByBlock: React.FC<KeyByBlockProps> = ({
  block,
  onChange,
  allFields,
  inputData,
}) => {
  return (
    <div style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "8px",
          alignItems: "center",
        }}>
      <div style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "8px",
          alignItems: "center",
        }}>
        <label style={{ fontSize: "12px" }}>
          Key Field: 
        </label>
        <FieldSelector
          allFields={allFields}
          currentValue={block.config.keyField}
          onChange={onChange}
          name="keyField"
          placeholder="Select a field to use as key"
          inputData={inputData}
          style={{
            width: "120px",
            minWidth: "120px",
            height: "20px",
            padding: "0px 8px",
            fontSize: "12px",
          }}
        />
      </div>
    </div>
  );
}; 