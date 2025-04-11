import React from 'react';
import { Block } from '../types';

interface MapObjectBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const MapObjectBlock: React.FC<MapObjectBlockProps> = ({ block, onChange, allFields, inputData }) => {
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
            Key Transform:
          </label>
          <input
            name="keyTransform"
            placeholder="e.g. .key + ' times two'"
            value={block.config.keyTransform || ""}
            onChange={onChange}
            style={{
              width: "200px",
              minWidth: "200px",
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
            gap: "8px",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "12px", minWidth: "40px" }}>
            Value Transform:
          </label>
          <input
            name="valueTransform"
            placeholder="e.g. .value * 2"
            value={block.config.valueTransform || ""}
            onChange={onChange}
            style={{
              width: "200px",
              minWidth: "200px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "4px",
          alignItems: "center",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <small>Use .key to reference the original key and .value to reference the original value</small>
      </div>
    </div>
  );
};

export default MapObjectBlock; 