import React, { useState, useRef, useEffect } from 'react';
import { BLOCK_TYPES, BlockType } from './types';
import BLOCK_DESCRIPTIONS from './blockDescriptions';

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void;
  disabled?: boolean;
}

const BlockToolbar: React.FC<BlockToolbarProps> = ({ onAddBlock, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter block types based on search term
  const filteredTypes = BLOCK_TYPES.filter(type => {
    if (!searchTerm) return true; // Show all types when search is empty
    return (
      type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (BLOCK_DESCRIPTIONS[type] && BLOCK_DESCRIPTIONS[type].toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }).sort((a, b) => a.localeCompare(b));

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
    <div 
      ref={searchRef} 
      style={{ 
        position: 'relative', 
        marginTop: '8px',
        marginBottom: showSuggestions ? '300px' : '8px',
        width: '100%',
        maxWidth: '600px',
        zIndex: 1000
      }}
    >
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
          width: '100%',
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
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            marginTop: '4px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1001,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {filteredTypes.map((type) => (
            <div
              key={type}
              className="block-suggestion-item"
              onClick={() => handleSelectType(type)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                borderBottom: '1px solid #f3f4f6',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontWeight: 500 }}>{type}</div>
              {BLOCK_DESCRIPTIONS[type] && (
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
                  {BLOCK_DESCRIPTIONS[type]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockToolbar;