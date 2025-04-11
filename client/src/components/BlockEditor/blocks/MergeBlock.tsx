import React from 'react';
import { Block } from '../types';

interface MergeBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  availableInputs: string[];
  inputFileName: string | null;
}

const MergeBlock: React.FC<MergeBlockProps> = ({ 
  block, 
  onChange,
  availableInputs,
  inputFileName
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "32px",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <label>
          Merge with:
        </label>
        <select
          name="mergeWith"
          value={block.config.mergeWith || ""}
          onChange={onChange}
        >
          <option value="">Select a source</option>
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
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <label>
          Merge strategy:
        </label>
        <select
          name="mergeStrategy"
          value={block.config.mergeStrategy || "combine"}
          onChange={onChange}
        >
          <option value="combine">Combine fields</option>
          <option value="override">Replace by key</option>
          <option value="append">Append</option>
        </select>
      </div>
    </div>
  );
};

export default MergeBlock;