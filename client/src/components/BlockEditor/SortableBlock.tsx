import React, { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableBlockProps, Block } from "./types";
import FilterBlock from "./blocks/FilterBlock";
import MapBlock from "./blocks/MapBlock";
import SortBlock from "./blocks/SortBlock";
import MergeBlock from "./blocks/MergeBlock";
import ConvertBlock from "./blocks/ConvertBlock";
import FormatBlock from "./blocks/FormatBlock";
import BlockPreview from "./BlockPreview";

// This would normally import all block type components
// import MapBlock from './blocks/MapBlock';
// import SortBlock from './blocks/SortBlock';
// import MergeBlock from './blocks/MergeBlock';
// import ConvertBlock from './blocks/ConvertBlock';

const SortableBlock: React.FC<SortableBlockProps> = ({
  block,
  onChange,
  onDelete,
  allFields,
  inputData,
  isDraggingThis,
  availableInputs,
  inputFileName,
  blockOutput,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    animateLayoutChanges: () => false,
  });

  const blockRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Perform initial measurement when mounting the component
  useEffect(() => {
    if (!blockRef.current) return;

    if (isDragging) {
      // Record original dimensions before starting to drag
      const height = blockRef.current.offsetHeight;
      const width = blockRef.current.offsetWidth;

      // Apply these exact dimensions during dragging
      blockRef.current.style.height = `${height}px`;
      blockRef.current.style.width = `${width}px`;
      blockRef.current.style.minHeight = `${height}px`;
      blockRef.current.style.minWidth = `${width}px`;
      blockRef.current.style.maxHeight = `${height}px`;
      blockRef.current.style.maxWidth = `${width}px`;
      blockRef.current.style.overflow = "hidden";
      blockRef.current.style.backgroundColor = "#f3f4f6"; // Light gray
      blockRef.current.style.transition = "none";
    } else {
      // Reset styles after dragging
      blockRef.current.style.height = "";
      blockRef.current.style.width = "";
      blockRef.current.style.minHeight = "";
      blockRef.current.style.minWidth = "";
      blockRef.current.style.maxHeight = "";
      blockRef.current.style.maxWidth = "";
      blockRef.current.style.overflow = "";
      blockRef.current.style.backgroundColor = "";
      blockRef.current.style.transition = "";
    }
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: `1px solid ${block.hasError ? "#ff5555" : "#ccc"}`,
    borderRadius: "8px",
    padding: "8px",
    marginBottom: "8px",
    backgroundColor: block.hasError ? "#fff8f8" : "white",
    position: "relative" as const,
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box" as const,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? "0 5px 10px rgba(0,0,0,0.15)" : "none",
    willChange: "transform",
  };

  // Special rendering if the block is being moved
  if (isDraggingThis) {
    return (
      <div
        ref={setNodeRef}
        style={{
          opacity: 0.2,
          border: "1px dashed #ccc",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "8px",
          height: "120px",
        }}
      />
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (e.target.type === "checkbox") {
      const target = e.target as HTMLInputElement;
      onChange({
        ...block,
        config: {
          ...block.config,
          [target.name]: target.checked,
        },
      });
    } else {
      onChange({
        ...block,
        config: {
          ...block.config,
          [e.target.name]: e.target.value,
        },
      });
    }
  };

  const isDuplicateName =
    !!block.outputName && availableInputs.includes(block.outputName.trim());

  // Function to render the appropriate block configuration UI based on type
  const renderBlockContent = () => {
    if (isDragging) {
      return (
        <div style={{ textAlign: "center", color: "#999" }}>🟦 Moving...</div>
      );
    }

    // Use specialized block components based on block type
    switch (block.type) {
      case "filter":
        return (
          <FilterBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "map":
        return (
          <MapBlock
            block={block}
            onChange={handleChange}
            allFields={allFields}
            inputData={inputData}
          />
        );
      case "sort":
        return (
          <SortBlock
            block={block}
            onChange={handleChange}
            allFields={allFields}
            inputData={inputData}
          />
        );
        case "format":
          return (
            <FormatBlock
              block={block}
              onChange={handleChange}
              allFields={allFields}
              inputData={inputData}
            />
          );
      case "merge":
        return (
          <MergeBlock
            block={block}
            onChange={handleChange}
            availableInputs={availableInputs}
            inputFileName={inputFileName}
          />
        );
      case "convert":
        return <ConvertBlock block={block} onChange={handleChange} />;
      default:
        return <div>Configuration for {block.type} block</div>;
    }
  };
  

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        blockRef.current = el;
      }}
      style={style}
      {...attributes}
      className={isDragging ? "block-dragging" : ""}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "16px",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ minWidth: "40px" }}>Name:</label>
          <input
            type="text"
            value={block.outputName || ""}
            onChange={(e) => onChange({ ...block, outputName: e.target.value })}
            placeholder="ex: step1"
            style={{
              border: "1px solid",
              borderColor: isDuplicateName ? "red" : "#ccc",
              minWidth: "120px",
            }}
          />
        </div>

        {block.type !== "convert" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ minWidth: "55px" }}>Input:</label>
            <select
              value={block.input || ""}
              onChange={(e) => onChange({ ...block, input: e.target.value })}
              style={{
                border: "1px solid #ccc",
                minWidth: "120px",
                alignItems: "center",
              }}
            >
              {availableInputs.map((stepName) => (
                <option key={stepName} value={stepName}>
                  {stepName === "raw_data" && inputFileName
                    ? ` ${inputFileName}`
                    : stepName}
                </option>
              ))}
            </select>
            {block.input === "raw_data" && inputFileName && (
              <span
                style={{
                  backgroundColor: "#e2fbe9",
                  padding: "2px 6px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  marginLeft: "4px",
                  color: "#065f46",
                }}
              >
                🌱 Input Data
              </span>
            )}
          </div>
        )}
      </div>
      <div
        {...listeners}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          backgroundColor: "#f3f4f6",
          padding: "4px 12px",
          marginBottom: "8px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <strong>{block.type.toUpperCase()}</strong>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(block.id);
        }}
        style={{
          position: "absolute",
          background: "white",
          top: "13px",
          right: "8px",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Delete"
      >
        🗑️
      </button>

      <div style={{ marginTop: "8px" }}>{renderBlockContent()}</div>
      {!isDragging && (
        <BlockPreview
          outputData={blockOutput}
          isOpen={isPreviewOpen}
          onToggle={() => setIsPreviewOpen(!isPreviewOpen)}
          blockName={block.outputName || block.type}
        />
      )}
    </div>
  );
};

export default SortableBlock;
