import React from 'react';
import { Block } from '../types';

interface ConvertBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ConvertBlock: React.FC<ConvertBlockProps> = ({ block, onChange }) => {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      target: {
        name: 'format',
        value: e.target.value,
      },
    } as any);
  };

  return (
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
        Format:
      </label>
      <select
        name="format"
        value={block.config.format || ""}
        onChange={handleFormatChange}
        style={{
          width: "100px",
          minWidth: "100px",
          height: "20px",
          padding: "0px 8px",
          fontSize: "12px",
        }}
      >
        <option value="">Choose</option>
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
        <option value="xml">XML</option>
      </select>
    </div>
  );
};

export default ConvertBlock;