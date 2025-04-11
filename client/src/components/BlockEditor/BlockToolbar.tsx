import React from 'react';
import { BLOCK_TYPES, BlockType } from './types';

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void;
  disabled: boolean;
}

const BlockToolbar: React.FC<BlockToolbarProps> = ({ onAddBlock, disabled }) => {
  return (
    <div>
      {BLOCK_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onAddBlock(type)}
          style={{
            margin: "8px 4px",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            backgroundColor: "#f9fafb",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
          disabled={disabled}
        >
          Add {type}
        </button>
      ))}
    </div>
  );
};

export default BlockToolbar;