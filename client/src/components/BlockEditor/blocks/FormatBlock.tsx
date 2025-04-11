import React from "react";
import { Block } from "../types";

interface FormatBlockProps {
  block: Block;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  allFields?: string[];
  inputData?: any[] | null;
}

const FormatBlock: React.FC<FormatBlockProps> = ({ block, onChange }) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onChange({
      target: {
        name,
        value: checked,
      },
    } as any); // ✅ solution propre : on accepte ici le cast générique
  };
  

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Template (use curly braces for fields)</label>
        <textarea
          name="template"
          placeholder="Ex: {name} emits {impact.cch} kg CO2"
          value={block.config.template || ""}
          onChange={onChange}
          rows={3}
          style={{ minWidth: "300px" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Output field name</label>
        <input
          name="newField"
          placeholder="Ex: formatted"
          value={block.config.newField || ""}
          onChange={onChange}
        />
      </div>

      <div>
        <input
          type="checkbox"
          id={`keepOriginal-${block.id}`}
          name="keepOriginal"
          checked={!!block.config.keepOriginal}
          onChange={handleCheckboxChange}
        />
        <label htmlFor={`keepOriginal-${block.id}`}>Keep original fields</label>
      </div>
    </div>
  );
};


export default FormatBlock;
