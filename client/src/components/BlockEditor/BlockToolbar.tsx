import React, { useState, useRef, useEffect } from 'react';
import { BLOCK_TYPES, BlockType } from './types';

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void;
  disabled: boolean;
}

const BlockToolbar: React.FC<BlockToolbarProps> = ({ onAddBlock, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter block types based on search term
  const filteredTypes = BLOCK_TYPES.filter(type => 
    type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.block-suggestion-item') && 
          !target.closest('input[type="text"]')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelectType = (type: BlockType) => {
    onAddBlock(type);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', marginTop: '8px', width: '400px' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Search for a block type..."
        style={{
          width: '400px',
          boxSizing: 'border-box',
          padding: '8px 12px',
          height: '24px',
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          fontSize: '12px',
          backgroundColor: disabled ? '#f3f4f6' : 'white',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
        }}
        disabled={disabled}
      />
      
      {showSuggestions && filteredTypes.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '400px',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {filteredTypes.map((type) => (
            <div
              key={type}
              onClick={() => handleSelectType(type)}
              style={{
                padding: '4px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '12px',
              }}
              className="block-suggestion-item"
            >
              {type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockToolbar;