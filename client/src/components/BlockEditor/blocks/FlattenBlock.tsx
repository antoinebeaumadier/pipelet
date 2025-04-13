import React from 'react';
import { Block } from '../types';

interface FlattenBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | Block) => void;
}

const FlattenBlock: React.FC<FlattenBlockProps> = ({ block, onChange }) => {
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
          <option value="flatten">Flatten Objects</option>
          <option value="unflatten">Unflatten Objects</option>
          <option value="flattenArray">Flatten Arrays</option>
        </select>
      </div>

      {(block.config.operation === "flatten" || block.config.operation === "unflatten") && (
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
            {block.config.operation === "flatten" 
              ? "Flattens a nested object structure using this separator (ex: user.address.city → user_address_city)" 
              : "Character used to separate nested paths when unflattening (default: _)"}
          </div>
        </div>
      )}

      {block.config.operation === "flattenArray" && (
        <div
          style={{
            fontSize: "11px",
            color: "#666",
          }}
        >
          This operation flattens a nested array structure by one level.<br/>
          Example: [[1, 2], [3, 4]] → [1, 2, 3, 4]
        </div>
      )}
    </div>
  );
};

export default FlattenBlock; 