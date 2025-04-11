import React from 'react';
import { Block } from '../types';
import FieldSelector from '../../common/FieldSelector';

interface SortBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const SortBlock: React.FC<SortBlockProps> = ({ 
  block, 
  allFields, 
  inputData, 
  onChange 
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        gap: "32px",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "8px",
          alignItems: "flex-end",
        }}
      >
        <label>
          Field to sort
        </label>
        <FieldSelector
          allFields={allFields}
          currentValue={block.config.field}
          onChange={onChange}
          name="field"
          placeholder="Select a field"
          inputData={inputData}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "8px",
          alignItems: "flex-end",
        }}
      >
        <label>
          Order
        </label>
        <select
          name="operator"
          value={block.config.operator || ""}
          onChange={onChange}
        >
          <option value="">Choose order</option>
          <option value="asc">⬆️ Ascending (A-Z / 0-9)</option>
          <option value="desc">⬇️ Descending (Z-A / 9-0)</option>
        </select>
      </div>
    </div>
  );
};

export default SortBlock;