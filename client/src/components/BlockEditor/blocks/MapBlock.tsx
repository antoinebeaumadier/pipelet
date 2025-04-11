import React from 'react';
import { Block } from '../types';
import FieldSelector from '../../common/FieldSelector';

interface MapBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const MapBlock: React.FC<MapBlockProps> = ({ 
  block, 
  allFields, 
  inputData, 
  onChange 
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: e.target.checked,
      } as any,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "8px 32px",
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
          alignItems: "flex-end",
        }}
      >
        <label>
          Source field
        </label>
        <div>
          <FieldSelector
            allFields={allFields}
            currentValue={block.config.field}
            onChange={onChange}
            name="field"
            placeholder="Select a field"
            inputData={inputData}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "16px",
          alignItems: "flex-end",
        }}
      >
        <label>
          New field name
        </label>
        <input
          name="newField"
          placeholder="Ex: totalPrice"
          value={block.config.newField || ""}
          onChange={onChange}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "16px",
          alignItems: "flex-end",
        }}
      >
        <label>
          Transformation
        </label>
        <select
          name="transform"
          value={block.config.transform || ""}
          onChange={onChange}
        >
          <option value="">None</option>
          <option value="uppercase">Uppercase</option>
          <option value="lowercase">Lowercase</option>
          <option value="number">Number</option>
          <option value="string">Text</option>
          <option value="round">Round</option>
          <option value="math">Math</option>
          <option value="format">Format</option>
          <option value="extract">Extract</option>
        </select>
      </div>

      {block.config.transform === "math" && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "16px",
            alignItems: "flex-end",
          }}
        >
          <label>
            Math formula
          </label>
          <input
            name="transformOption"
            placeholder="Ex: value * 2"
            value={block.config.transformOption || ""}
            onChange={onChange}
          />
        </div>
      )}

      {block.config.transform === "format" && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "16px",
            alignItems: "flex-end",
          }}
        >
          <label>
            Custom format
          </label>
          <input
            name="transformOption"
            placeholder="Ex: Price: {value} €"
            value={block.config.transformOption || ""}
            onChange={onChange}
          />
        </div>
      )}

      {block.config.transform === "extract" && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "16px",
            alignItems: "flex-end",
          }}
        >
          <label>
            Extraction
          </label>
          <input
            name="transformOption"
            placeholder="Ex: 0:5"
            value={block.config.transformOption || ""}
            onChange={onChange}
          />
        </div>
      )}

      {block.config.transform === "round" && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "16px",
            alignItems: "flex-end",
          }}
        >
          <label>
            Decimals
          </label>
          <input
            name="transformOption"
            placeholder="Ex: 2"
            type="number"
            min="0"
            max="10"
            value={block.config.transformOption || ""}
            onChange={onChange}
          />
        </div>
      )}

      <div>
        <input
          type="checkbox"
          id={`keepNested-${block.id}`}
          name="keepNestedStructure"
          checked={block.config.keepNestedStructure || false}
          onChange={handleCheckboxChange}
        />
        <label
          htmlFor={`keepNested-${block.id}`}
        >
          Maintain nested structure
        </label>
      </div>
    </div>
  );
};

export default MapBlock;