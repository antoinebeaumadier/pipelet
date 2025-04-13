import React from 'react';
import { Block } from '../types';

interface ConvertBlockProps {
  block: Block;
  onChange: (block: Block) => void;
}

const ConvertBlock: React.FC<ConvertBlockProps> = ({ block, onChange }) => {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlock = {
      ...block,
      config: {
        ...block.config,
        format: e.target.value,
      },
    };
    onChange(newBlock);
  };

  const handleConfigChange = (name: string, value: string | boolean | number) => {
    const newBlock = {
      ...block,
      config: {
        ...block.config,
        [name]: value,
      },
    };
    onChange(newBlock);
  };

  const renderFormatOptions = () => {
    switch (block.config.format) {
      case 'csv':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: "12px" }}>Delimiter:</label>
              <select
                value={block.config.delimiter || ','}
                onChange={(e) => handleConfigChange('delimiter', e.target.value)}
                style={{ width: '100px', height: '20px', fontSize: '12px' }}
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: "12px" }}>Has Header:</label>
              <input
                type="checkbox"
                checked={block.config.hasHeader ?? true}
                onChange={(e) => handleConfigChange('hasHeader', e.target.checked)}
              />
            </div>
          </div>
        );
      case 'json':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: "12px" }}>Pretty Print:</label>
              <input
                type="checkbox"
                checked={block.config.prettyPrint ?? true}
                onChange={(e) => handleConfigChange('prettyPrint', e.target.checked)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: "12px" }}>Indentation:</label>
              <select
                value={block.config.indentation || '2'}
                onChange={(e) => handleConfigChange('indentation', e.target.value)}
                style={{ width: '100px', height: '20px', fontSize: '12px' }}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tab</option>
              </select>
            </div>
          </div>
        );
      case 'xml':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: "12px" }}>Namespaces:</label>
              <select
                value={block.config.namespaceHandling || 'preserve'}
                onChange={(e) => handleConfigChange('namespaceHandling', e.target.value)}
                style={{ width: '100px', height: '20px', fontSize: '12px' }}
              >
                <option value="preserve">Preserve</option>
                <option value="strip">Strip</option>
                <option value="prefix">Prefix</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
        <label style={{ fontSize: "12px" }}>
          Format:
        </label>
        <select
          name="format"
          value={block.config.format || ""}
          onChange={handleFormatChange}
          style={{
            width: "100px",
            minWidth: "100px",
            height: "20px",
            padding: "0px 8px",
            fontSize: "12px",
          }}
        >
          <option value="">Choose</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </select>
      </div>

      {block.config.format && (
        <>
          {renderFormatOptions()}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: "12px" }}>Encoding:</label>
            <select
              value={block.config.encoding || 'utf-8'}
              onChange={(e) => handleConfigChange('encoding', e.target.value)}
              style={{ width: '100px', height: '20px', fontSize: '12px' }}
            >
              <option value="utf-8">UTF-8</option>
              <option value="ascii">ASCII</option>
              <option value="latin1">Latin-1</option>
              <option value="utf-16">UTF-16</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default ConvertBlock;