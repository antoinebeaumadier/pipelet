import React from 'react';
import { BlockPreviewProps } from './types';

const BlockPreview: React.FC<BlockPreviewProps> = ({ 
  outputData, 
  isOpen, 
  onToggle, 
  blockName 
}) => {
  const hasData = outputData && outputData.length > 0;
  
  return (
    <div style={{ marginTop: "8px" }}>
      <button
        onClick={onToggle}
        style={{
          backgroundColor: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {isOpen ? "▼" : "►"} {isOpen ? "Hide" : "Show"} {blockName} preview
        {hasData && (
          <span style={{ marginLeft: "4px", color: "#6b7280" }}>
            ({outputData.length} items)
          </span>
        )}
      </button>

      {isOpen && hasData && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px",
            backgroundColor: "#fafafa",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            maxHeight: "150px",
            overflowY: "auto",
          }}
        >
          <pre style={{ margin: 0, fontSize: "12px" }}>
            {JSON.stringify(
              // Show just a sample of the data to avoid rendering too much
              outputData.slice(0, 3),
              null,
              2
            )}
            {outputData.length > 3 && (
              <div style={{ color: "#6b7280", marginTop: "4px" }}>
                ... {outputData.length - 3} more items
              </div>
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BlockPreview;