import React from 'react';
import { Block } from '../types';

interface RegexBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
  allFields: string[];
  inputData: any[] | null;
}

const RegexBlock: React.FC<RegexBlockProps> = ({ block, onChange, allFields }) => {
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
            Field:
          </label>
          <select
            name="field"
            value={block.config.field || ''}
            onChange={onChange}
            style={{
              width: "150px",
              minWidth: "150px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          >
            <option value="">Entire item</option>
            {allFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
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
            Pattern:
          </label>
          <input
            name="pattern"
            placeholder="e.g. ^[a-z]+$"
            value={block.config.pattern || ''}
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
            Flags:
          </label>
          <input
            name="flags"
            placeholder="e.g. i"
            value={block.config.flags || ''}
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
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#666",
          marginTop: "0px",
        }}
      >
      
        <div style={{ marginTop: "4px" }}>
          Common flags: i (case-insensitive), g (global), m (multiline)
        </div>
      </div>
    </div>
  );
};

export default RegexBlock; 