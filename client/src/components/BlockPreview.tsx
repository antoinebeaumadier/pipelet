import React, { useState, useRef, useEffect, CSSProperties } from 'react';

// Styles CSS purs avec types corrects pour React
const styles: Record<string, CSSProperties> = {
  container: {
    marginTop: '15px',
    borderTop: '1px solid #eaeaea',
    paddingTop: '8px'
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#f9f9f9',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const, // Type spécifique pour textAlign
    transition: 'background-color 0.2s ease',
    outline: 'none'
  },
  toggleButtonHover: {
    backgroundColor: '#f0f0f0'
  },
  toggleButtonContents: {
    display: 'flex',
    alignItems: 'center'
  },
  arrowIcon: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
    transition: 'transform 0.2s ease'
  },
  arrowIconRotated: {
    transform: 'rotate(180deg)'
  },
  titleText: {
    fontSize: '14px',
    fontWeight: 500
  },
  boldText: {
    fontWeight: 600
  },
  badge: {
    padding: '4px 8px',
    backgroundColor: '#e6f0ff',
    color: '#0052cc',
    fontSize: '12px',
    borderRadius: '12px',
    fontWeight: 500
  },
  previewContent: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    border: '1px solid #eaeaea',
    borderTop: 'none',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px'
  },
  previewInner: {
    padding: '12px',
    backgroundColor: '#ffffff',
    overflow: 'auto',
    maxHeight: '300px'
  },
  previewText: {
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    margin: 0
  },
  emptyState: {
    textAlign: 'center' as const, // Type spécifique pour textAlign
    padding: '32px 0',
    color: '#888888',
    fontStyle: 'italic'
  }
};

function BlockPreview({ 
  outputData,
  isOpen,
  onToggle,
  blockName
}: { 
  outputData: any[] | null;
  isOpen: boolean;
  onToggle: () => void;
  blockName?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [hover, setHover] = useState(false);
  
  // Mesurer la hauteur réelle du contenu quand il est ouvert
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [isOpen, outputData]);
  
  const getPreviewSample = () => {
    if (!outputData) return 'Aucune donnée';
    
    if (Array.isArray(outputData)) {
      return `${outputData.length} élément(s)`;
    }
    
    return '1 objet';
  };
  
  return (
    <div style={styles.container}>
      <button 
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...styles.toggleButton,
          ...(hover ? styles.toggleButtonHover : {})
        }}
      >
        <div style={styles.toggleButtonContents}>
          <svg 
            style={{
              ...styles.arrowIcon,
              ...(isOpen ? styles.arrowIconRotated : {})
            }}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
          <span style={styles.titleText}>
            Aperçu du résultat de <span style={styles.boldText}>{blockName || 'ce bloc'}</span> ({getPreviewSample()})
          </span>
        </div>
        
        {outputData && (
          <div>
            <span style={styles.badge}>
              {Array.isArray(outputData) ? 'Array' : 'Object'}
            </span>
          </div>
        )}
      </button>
      
      <div 
        style={{ 
          ...styles.previewContent,
          maxHeight: isOpen ? `${Math.min(contentHeight, 300)}px` : '0px',
        }}
      >
        <div ref={contentRef} style={styles.previewInner}>
          {outputData ? (
            <pre style={styles.previewText}>
              {JSON.stringify(outputData, null, 2)}
            </pre>
          ) : (
            <div style={styles.emptyState}>
              Aucune donnée disponible pour ce bloc
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlockPreview;