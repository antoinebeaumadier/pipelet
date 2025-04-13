import React from "react";
import { Block } from "../types";

interface JoinBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
}

const JoinBlock: React.FC<JoinBlockProps> = ({ block, onChange }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <label style={{ minWidth: "80px", fontSize: "14px" }}>Separator:</label>
        <input
          type="text"
          name="separator"
          value={block.config.separator || ""}
          onChange={onChange}
          placeholder="Default: empty string"
          style={{
            border: "1px solid #ccc",
            padding: "4px 8px",
            borderRadius: "4px",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default JoinBlock; 