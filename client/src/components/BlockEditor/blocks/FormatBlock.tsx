import React from "react";
import { Block } from "../types";

interface FormatBlockProps {
  block: Block;
  allFields: string[];
  inputData: any[] | null;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const FormatBlock: React.FC<FormatBlockProps> = ({ block, onChange }) => {
  const handleCheckboxChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const syntheticEvent = {
      target: {
        name,
        value: checked,
        type: 'checkbox',
        checked,
      },
      currentTarget: e.currentTarget,
      nativeEvent: e.nativeEvent,
      bubbles: e.bubbles,
      cancelable: e.cancelable,
      defaultPrevented: e.defaultPrevented,
      eventPhase: e.eventPhase,
      isTrusted: e.isTrusted,
      timeStamp: e.timeStamp,
      type: e.type,
      preventDefault: () => {},
      isDefaultPrevented: () => false,
      stopPropagation: () => {},
      isPropagationStopped: () => false,
      persist: () => {},
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  }, [onChange]);

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
            Template:
          </label>
          <textarea
            name="template"
            placeholder="Ex: {name} emits {impact.cch} kg CO2"
            value={block.config.template || ""}
            onChange={onChange}
            rows={1}
            style={{ 
              width: "300px",
              minWidth: "300px",
              maxWidth: "300px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              resize: "vertical",
              maxHeight: "100px",
              fontSize: "12px",
              lineHeight: "1.2",
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
            Output:
          </label>
          <input
            name="newField"
            placeholder="Ex: formatted"
            value={block.config.newField || ""}
            onChange={onChange}
            style={{
              width: "100px",
              minWidth: "100px",
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
            gap: "4px",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            id={`keepOriginal-${block.id}`}
            name="keepOriginal"
            checked={!!block.config.keepOriginal}
            onChange={handleCheckboxChange}
            style={{
              margin: 0,
              width: "14px",
              height: "14px",
            }}
          />
          <label htmlFor={`keepOriginal-${block.id}`} style={{ fontSize: "12px" }}>
            Keep original
          </label>
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#666",
          marginTop: "0px",
        }}
      >
        <div>
          Use {'{'}field{'}'} to reference fields from the current item. Example: {'{'}name{'}'} {'->'} "John"
        </div>
        <div style={{ marginTop: "4px" }}>
          Reference syntax: (1) "$input.field" maps field across all input items, (2) "$input[0].field" accesses a specific item, (3) "$stepName.field" or "$stepName[index].field" for other steps.
        </div>
      </div>
    </div>
  );
};

export default FormatBlock;
