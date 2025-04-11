import React, { useState } from 'react';
import { InputBlockProps } from './types';
import BlockPreview from './BlockPreview';

const InputBlock: React.FC<InputBlockProps> = ({ inputData, fileName }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "8px",
        marginTop: "16px",
        backgroundColor: "#f0f9ff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <strong>INPUT DATA</strong>
        {fileName && (
          <span>({fileName})</span>
        )}
      </div>
      <div>
        {inputData.length} records loaded
      </div>

      <BlockPreview
        outputData={inputData}
        isOpen={isPreviewOpen}
        onToggle={() => setIsPreviewOpen(!isPreviewOpen)}
        blockName="Input Data"
      />
    </div>
  );
};

export default InputBlock;