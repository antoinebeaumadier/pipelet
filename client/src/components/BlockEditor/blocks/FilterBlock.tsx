import React from 'react';
import { Block } from '../types';
import FieldSelector from '../../common/FieldSelector';

interface FilterBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FilterBlock: React.FC<FilterBlockProps> = ({ 
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
        gap: "8px",
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
        <FieldSelector
          allFields={allFields}
          currentValue={block.config.field}
          onChange={onChange}
          name="field"
          placeholder="Field"
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
        <select
          name="operator"
          value={block.config.operator || ""}
          onChange={onChange}
        >
          <option value="">Operator</option>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value="==">=</option>
          <option value="!=">!=</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
        </select>
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
        <input
          name="value"
          placeholder="Value"
          value={block.config.value || ""}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default FilterBlock;