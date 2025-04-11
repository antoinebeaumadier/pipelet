import React from 'react';
import { Block } from '../types';

interface ConvertBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ConvertBlock: React.FC<ConvertBlockProps> = ({ 
  block, 
  onChange 
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "32px",
        alignItems: "flex-end",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "16px 16px",
          padding: "0px 0px",
          alignItems: "flex-end",
        }}
      >
        <label>
          Output format
        </label>
        <select
          name="format"
          value={block.config.format || ""}
          onChange={onChange}
        >
          <option value="">Choose a format</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>
    </div>
  );
};

export default ConvertBlock;