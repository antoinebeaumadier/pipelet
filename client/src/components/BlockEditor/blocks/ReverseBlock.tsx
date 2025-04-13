import React from 'react';
import { Block } from '../types';

interface ReverseBlockProps {
  block: Block;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | Block) => void;
}

const ReverseBlock: React.FC<ReverseBlockProps> = ({ block, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '12px', color: '#666' }}>
        This block will reverse the order of items in the array.
      </div>
    </div>
  );
};

export default ReverseBlock; 