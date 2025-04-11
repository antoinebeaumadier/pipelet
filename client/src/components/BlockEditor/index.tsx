import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  MeasuringStrategy,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

// Import components and types
import { Block, BlockType } from "./types";
import BlockToolbar from "./BlockToolbar";
import InputBlock from "./InputBlock";
import SortableBlock from "./SortableBlock";

// Import utilities
import { extractAllFields, parseCSV } from "../../utils/dataUtils";
import { applyPipeline } from "../../utils/pipeline";

const BlockEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [inputData, setInputData] = useState<any[]>([]);
  const [outputData, setOutputData] = useState<any>(null);
  const [allFields, setAllFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputFileName, setInputFileName] = useState<string | null>(null);

  // Set up the global styles
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      body.dragging {
        cursor: grabbing !important;
        user-select: none;
      }
      body.dragging * {
        cursor: grabbing !important;
      }
      
      /* This rule is crucial for fixing width during drag */
      [data-dnd-draggable] {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        transform-origin: 50% 50% !important;
        transition: transform 30ms ease-out !important;
        transition-property: transform !important;
      }
      
      /* Styles for the element being moved */
      .block-dragging {
        pointer-events: none !important;
        transition: none !important;
        min-height: 120px !important;
        height: 120px !important;
        max-height: 120px !important;
        overflow: hidden !important;
        background-color: #f3f4f6 !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Extract fields when input data changes
  useEffect(() => {
    if (inputData && inputData.length > 0) {
      const fields = extractAllFields(inputData);
      setAllFields(fields);
    }
  }, [inputData]);

  // Add a new block to the pipeline
  const addBlock = (type: BlockType) => {
    const nextStepNumber = blocks.length + 1;
    const newOutputName = `step${nextStepNumber}`;
    const previousOutput = blocks.at(-1)?.outputName || "raw_data";
    setBlocks([
      ...blocks,
      {
        id: uuidv4(),
        type,
        config: {},
        outputName: newOutputName,
        input: previousOutput,
      },
    ]);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
    document.body.classList.add("dragging");
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false);
    document.body.classList.remove("dragging");

    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      // Create a new array with the blocks in their new order
      const reorderedBlocks = arrayMove([...blocks], oldIndex, newIndex);

      // Update input references for all blocks to maintain pipeline integrity
      const updatedBlocks = reorderedBlocks.map((block, index) => {
        // For the first block, ensure input is raw_data
        if (index === 0) {
          return { ...block, input: "raw_data" };
        }

        // For subsequent blocks, check if their input is still valid
        const availableInputs = [
          "raw_data",
          ...reorderedBlocks
            .slice(0, index)
            .map((b) => b.outputName)
            .filter(Boolean),
        ];

        // If current input is not available after reordering, set to previous block's output
        if (!availableInputs.includes(block.input || "")) {
          const previousBlockOutput = reorderedBlocks[index - 1]?.outputName;
          return { ...block, input: previousBlockOutput || "raw_data" };
        }

        return block;
      });

      // Apply the updated blocks
      setBlocks(updatedBlocks);
    }
  };

  // Calculate intermediate outputs for each block
  const calculateIntermediateOutputs = useCallback(() => {
    const outputs: Record<string, any[]> = {
      raw_data: inputData,
      input: inputData,
    };
  
    let updatedBlocks = [...blocks];
    let blocksChanged = false;
  
    blocks.forEach((_, index) => {
      try {
        const output = applyPipeline(inputData, blocks.slice(0, index + 1));
        const block = blocks[index];
  
        if (block.hasError) {
          updatedBlocks[index] = { ...block, hasError: false };
          blocksChanged = true;
        }
  
        if (block.outputName) {
          outputs[block.outputName] = output;
        }
      } catch (error) {
        const block = blocks[index];
  
        console.error(`Error processing block ${block.outputName || block.type}:`, error);
  
        if (!block.hasError) {
          updatedBlocks[index] = { ...block, hasError: true };
          blocksChanged = true;
        }
  
        if (block.outputName) {
          outputs[block.outputName] = [];
        }
      }
    });
  
    if (blocksChanged) {
      setBlocks(updatedBlocks);
    }
  
    return outputs;
  }, [blocks, inputData]);
  

  // Handle changes to a block
  const handleBlockChange = (updatedBlock: Block) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((b) => {
        if (b.id === updatedBlock.id) return updatedBlock;

        const oldBlock = prevBlocks.find((b) => b.id === updatedBlock.id);
        const oldOutputName = oldBlock?.outputName;

        // Update inputs that reference the old name
        if (oldOutputName && b.input === oldOutputName) {
          return {
            ...b,
            input: updatedBlock.outputName || "",
          };
        }

        return b;
      })
    );
  };

  // Handle block deletion
  const handleBlockDelete = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(content);
          const data = Array.isArray(parsed) ? parsed : [parsed];
          setInputData(data);
          setOutputData(data);
          setAllFields(extractAllFields(data));
          setInputFileName(file.name);
        } else if (file.name.endsWith(".csv")) {
          const data = parseCSV(content);
          setInputData(data);
          setOutputData(data);
          setAllFields(extractAllFields(data));
          setInputFileName(file.name);
        }
      } catch (err) {
        alert("Error reading file");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Memoize intermediate outputs to avoid recalculation
  const intermediateOutputs = useMemo(() => {
    return calculateIntermediateOutputs();
  }, [calculateIntermediateOutputs]);

  // Update output data when blocks or input data change
  useEffect(() => {
    if (inputData && inputData.length > 0) {
      try {
        const outputs = calculateIntermediateOutputs();
        const lastBlockOutput = blocks.length > 0 
          ? blocks[blocks.length - 1].outputName 
          : "raw_data";
          
      setOutputData(lastBlockOutput && outputs[lastBlockOutput] ? outputs[lastBlockOutput] : outputs["raw_data"]);
      } catch (error) {
        console.error("Error calculating pipeline outputs:", error);
      }
    }
  }, [blocks, inputData, calculateIntermediateOutputs]);

  return (
    <div>
      {/* Fixed header panel */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          margin: "-8px 0px 8px 0px",
          padding: "0px 0px 0px 0px",
          height: "140px"
        }}
      >
        <h1>🧱 Pipeline Editor</h1>

        <div>
          <label>
            📂 Load a CSV or JSON file
          </label>
          <input
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            className="block"
            disabled={isLoading || isDragging}
            style={{
              margin: "0px 8px",
            }}
          />
        </div>

        {/* Block addition toolbar */}
        <BlockToolbar onAddBlock={addBlock} disabled={isLoading || isDragging} />
      </div>

      {/* Scrollable content */}
      <div>
        <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
          {/* Left column - 70% */}
          <div
            style={{
              width: "70%",
              maxHeight: "calc(97vh - 200px)",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            {/* Input data */}
            {inputData && inputData.length > 0 && (
              <InputBlock inputData={inputData} fileName={inputFileName} />
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div>
                <p>Processing...</p>
              </div>
            )}

            {/* Drag and drop context */}
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              measuring={{
                droppable: {
                  strategy: MeasuringStrategy.Always,
                },
              }}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => {
                  const availableInputs = [
                    "raw_data",
                    ...blocks
                      .slice(0, index)
                      .map((b) => b.outputName)
                      .filter((name): name is string => !!name),
                  ];
                  const inputForCurrentBlock =
                    intermediateOutputs[block.input || "raw_data"];
                  const availableFields = extractAllFields(
                    inputForCurrentBlock || []
                  );

                  return (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      onChange={handleBlockChange}
                      onDelete={handleBlockDelete}
                      allFields={availableFields}
                      inputData={inputForCurrentBlock}
                      isDraggingThis={activeId === block.id}
                      availableInputs={availableInputs}
                      inputFileName={inputFileName}
                      blockOutput={intermediateOutputs[block.outputName || ""]}
                    />
                  );
                })}
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "16px",
                      backgroundColor: "#f3f4f6",
                      boxShadow: "0 5px 10px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "0px",
                        marginBottom: "12px",
                        backgroundColor: "#e5e7eb",
                      }}
                    >
                      <strong>
                        {blocks
                          .find((b) => b.id === activeId)
                          ?.type.toUpperCase()}
                      </strong>
                    </div>
                    <div style={{ textAlign: "center", color: "#666" }}>
                      🟦 Moving...
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Right column - 30% */}
          <div
            style={{
              width: "30%",
              backgroundColor: "#f9f9f9",
              padding: "16px",
              borderRadius: "8px",
              position: "sticky",
              top: "calc(16px + 250px)", /* Adjustment for header */
              height: "calc(97vh - 250px)", /* Fixed height */
              display: "flex",
              flexDirection: "column",
              overflow: "hidden", /* Prevent internal scrolling */
            }}
          >
            <h2 style={{ fontWeight: "bold", marginBottom: "16px" }}>
              📤 Pipeline Result
            </h2>
            {outputData ? (
              <pre
                style={{
                  backgroundColor: "white",
                  padding: "12px",
                  borderRadius: "4px",
                  height: "calc(100vh - 350px)", /* Adjustment for header */
                  overflow: "auto",
                  margin: 0,
                  flex: 1,
                }}
              >
                {JSON.stringify(outputData, null, 2)}
              </pre>
            ) : (
              <div
                style={{
                  color: "#666",
                  textAlign: "center",
                  padding: "16px",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                No results available. Run the pipeline to see transformed data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockEditor;