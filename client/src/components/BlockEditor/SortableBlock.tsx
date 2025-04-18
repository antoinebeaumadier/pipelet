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
import GroupByBlock from "./blocks/AggregateBlock";
import FlattenBlock from "./blocks/FlattenBlock";
import GetBlock from "./blocks/GetBlock";
import ReverseBlock from "./blocks/ReverseBlock";
import PickBlock from "./blocks/PickBlock";
import MapObjectBlock from "./blocks/MapObjectBlock";
import BlockPreview from "./BlockPreview";
import MapKeysBlock from "./blocks/MapKeysBlock";
import MapValuesBlock from "./blocks/MapValuesBlock";
import CreateObjectBlock from "./blocks/CreateObjectBlock";
import CreateArrayBlock from "./blocks/CreateArrayBlock";
import { KeyByBlock } from "./blocks/KeyByBlock";
import KeysBlock from "./blocks/KeysBlock";
import ValuesBlock from "./blocks/ValuesBlock";
import JoinBlock from "./blocks/JoinBlock";
import SplitBlock from "./blocks/SplitBlock";
import UniqueBlock from "./blocks/UniqueBlock";
import LimitBlock from "./blocks/LimitBlock";
import LengthBlock from "./blocks/LengthBlock";
import MinBlock from "./blocks/MinBlock";
import MaxBlock from "./blocks/MaxBlock";
import RegexBlock from "./blocks/RegexBlock";
import ValidateBlock from './blocks/ValidateBlock';
import BLOCK_DESCRIPTIONS from "./blockDescriptions";

// This would normally import all block type components
// import MapBlock from './blocks/MapBlock';
// import SortBlock from './blocks/SortBlock';
// import MergeBlock from './blocks/MergeBlock';
// import ConvertBlock from './blocks/ConvertBlock';

const SortableBlock: React.FC<SortableBlockProps> = ({
  block,
  onBlockChange,
  onBlockDelete,
  allFields,
  inputData,
  isDraggingThis,
  availableInputs,
  inputFileName,
  blockOutput,
  context,
  blocks,
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
    backgroundColor: block.hasError ? "#fff8f8" : block.enabled === false ? "#f9fafb" : "white",
    position: "relative" as const,
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box" as const,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? "0 5px 10px rgba(0,0,0,0.15)" : "none",
    willChange: "transform",
    opacity: block.enabled === false ? 0.7 : 1,
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

  // Handle changes to a block
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block
  ) => {
    if ('target' in e) {
      // Handle event-based changes
      if (e.target.type === "checkbox") {
        const target = e.target as HTMLInputElement;
        onBlockChange({
          ...block,
          config: {
            ...block.config,
            [target.name]: target.checked,
          },
        });
      } else {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        onBlockChange({
          ...block,
          config: {
            ...block.config,
            [target.name]: target.value,
          },
        });
      }
    } else {
      // Handle direct block updates
      onBlockChange(e);
    }
  };

  const handleDelete = () => {
    onBlockDelete(block.id);
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
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "sort":
        return (
          <SortBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "merge":
        return (
          <MergeBlock
            block={block}
            onChange={handleChange}
            availableInputs={availableInputs}
            inputFileName={inputFileName}
            allFields={allFields}
            inputData={inputData}
            mergeData={block.config.mergeWith ? (context?.[block.config.mergeWith] || null) : null}
          />
        );

      case "convert":
        return <ConvertBlock block={block} onChange={handleChange} />;

      case "format":
        return (
          <FormatBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "groupBy":
        return (
          <GroupByBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "flatten":
        return (
          <FlattenBlock
            block={block}
            onChange={handleChange}
          />
        );

      case "get":
        return (
          <GetBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "reverse":
        return (
          <ReverseBlock
            block={block}
            onChange={handleChange}
          />
        );

      case "pick":
        return (
          <PickBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "mapObject":
        return (
          <MapObjectBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "mapKeys":
        return (
          <MapKeysBlock
            block={block}
            onChange={handleChange}
          />
        );

      case "mapValues":
        return (
          <MapValuesBlock
            block={block}
            onChange={handleChange}
          />
        );

      case "createObject":
        return (
          <CreateObjectBlock
            block={block}
            onChange={handleChange}
          />
        );

      case "createArray":
        return (
          <CreateArrayBlock
            block={block}
            onChange={handleChange}
          />
        );

      case "keyBy":
        return (
          <KeyByBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "keys":
        return (
          <KeysBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "values":
        return (
          <ValuesBlock
            block={block}
            allFields={allFields}
            inputData={inputData}
            onChange={handleChange}
          />
        );

      case "join":
        return (
          <JoinBlock
            block={block}
            onChange={handleChange}
          />
        );

      case "split":
        return (
          <SplitBlock
            block={block}
            onChange={handleChange}
            allFields={allFields}
            inputData={inputData}
          />
        );

      case "unique":
        return (
          <UniqueBlock
            block={block}
            onChange={handleChange}
            allFields={allFields}
            inputData={inputData}
          />
        );

      case "limit":
        return (
          <LimitBlock
            block={block}
            onChange={handleChange}
            allFields={allFields}
            inputData={inputData}
          />
        );

      case "length":
        return (
          <LengthBlock
            block={block}
            onChange={handleChange}
            allFields={allFields}
            inputData={inputData}
          />
        );

      case "min":
        return (
          <MinBlock
            block={block}
            onChange={handleChange}
            allFields={allFields}
            inputData={inputData}
          />
        );

      case "max":
        return (
          <MaxBlock
            block={block}
            onChange={handleChange}
            allFields={allFields}
            inputData={inputData}
          />
        );

      case "regex":
        return <RegexBlock block={block} onChange={handleChange} allFields={allFields} inputData={inputData} />;
      case "validate":
        return <ValidateBlock 
          block={block} 
          onChange={handleChange} 
          allFields={allFields} 
          context={context}
          inputFileName={inputFileName || undefined}
          blocks={blocks}
        />;
      default:
        return <div>Unknown block type: {block.type}</div>;
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
        <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
          <label style={{ minWidth: "40px", fontSize: "12px" }}>Name:</label>
          <input
            type="text"
            value={block.outputName || ""}
            onChange={(e) => onBlockChange({ ...block, outputName: e.target.value })}
            placeholder="ex: step1"
            style={{
              border: "1px solid",
              borderColor: isDuplicateName ? "red" : "#ccc",
              minWidth: "120px",
              height: "20px",
              padding: "0px 8px",
              fontSize: "12px",
            }}
          />
        </div>

        {block.type !== "convert" && block.type !== "createObject" && block.type !== "createArray" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ minWidth: "20px", fontSize: "12px" }}>Input:</label>
            <select
              value={block.input || ""}
              onChange={(e) => onBlockChange({ ...block, input: e.target.value })}
              style={{
                border: "1px solid #ccc",
                minWidth: "120px",
                height: "20px",
                padding: "0px 8px",
                fontSize: "12px",
              }}
              className="square-select"
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
        }}
      >
        <strong>{block.type.toUpperCase()}</strong>
        {BLOCK_DESCRIPTIONS[block.type] && (
          <div
            style={{
              fontSize: "11px",
              color: "#666",
              marginLeft: "12px",
            }}
          >
            {BLOCK_DESCRIPTIONS[block.type]}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBlockChange({ ...block, enabled: !block.enabled });
          }}
          style={{
            backgroundColor: block.enabled ? "#f3f4f6" : "#ef4444",
            color: block.enabled ? "#374151" : "white",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "normal",
          }}
          aria-label={block.enabled ? "Disable" : "Enable"}
        >
          {block.enabled ? "Enabled" : "Disabled"}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "black",
            fontSize: "16px",
            fontWeight: "bold",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Delete"
        >
          ×
        </button>
      </div>

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
