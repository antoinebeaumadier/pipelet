import React from 'react';
import { Block } from '../types';

interface StructureBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const StructureBlock: React.FC<StructureBlockProps> = ({ block, onChange }) => {
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
        <label style={{ fontSize: "12px", minWidth: "40px" }}>
          Operation:
        </label>
        <select
          name="operation"
          value={block.config.operation || "flatten"}
          onChange={onChange}
          style={{
            width: "120px",
            minWidth: "120px",
            height: "20px",
            padding: "0px 8px",
            fontSize: "12px",
          }}
        >
          <option value="flatten">Flatten</option>
          <option value="unflatten">Unflatten</option>
          <option value="restructure">Restructure</option>
        </select>
      </div>

      {block.config.operation === "restructure" && (
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
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Template:
            </label>
            <input
              name="template"
              placeholder="Ex: {newPath: 'old.path'}"
              value={block.config.template || ""}
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
          <div style={{ fontSize: "10px", color: "#666" }}>
            Use dot notation for paths. Example: {"{newPath: 'old.path'}"}
          </div>
        </div>
      )}

      {block.config.operation === "unflatten" && (
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
            <label style={{ fontSize: "12px", minWidth: "40px" }}>
              Separator:
            </label>
            <input
              name="separator"
              placeholder="Ex: _"
              value={block.config.separator || "_"}
              onChange={onChange}
              style={{
                width: "50px",
                minWidth: "50px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
            />
          </div>
          <div style={{ fontSize: "10px", color: "#666" }}>
            Character used to separate nested paths (default: _)
          </div>
        </div>
      )}
    </div>
  );
};

export default StructureBlock; 