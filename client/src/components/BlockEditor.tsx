import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, MeasuringStrategy, DragOverlay, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

const BLOCK_TYPES = ['filter', 'map', 'convert', 'sort'] as const;
type BlockType = (typeof BLOCK_TYPES)[number];

interface BlockConfig {
  field?: string;
  operator?: string;
  value?: string;
  newField?: string;
  format?: string;
  transform?: string;
  transformOption?: string;
  keepNestedStructure?: boolean;
}

interface Block {
  id: string;
  type: BlockType;
  config: BlockConfig;
}

// Fonction pour extraire tous les champs, y compris les champs imbriqués
function extractAllFields(data: any[]): string[] {
  if (!data || data.length === 0) return [];
  
  const fields = new Set<string>();
  
  function extractFieldsFromObject(obj: any, prefix = '') {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      fields.add(fieldPath);
      
      // Récursion pour les objets imbriqués
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        extractFieldsFromObject(obj[key], fieldPath);
      }
    });
  }
  
  // Extraire les champs du premier objet (suffisant pour l'aperçu)
  extractFieldsFromObject(data[0]);
  
  // Convertir en tableau et trier par ordre alphabétique
  return Array.from(fields).sort((a, b) => a.localeCompare(b));
}

// Fonction pour obtenir les champs imbriqués d'un champ spécifique
function getNestedFields(data: any[], parentField: string): string[] {
  if (!data || data.length === 0 || !parentField) return [];
  
  const nestedFields = new Set<string>();
  const firstItem = data[0];
  const parentValue = getNestedValue(firstItem, parentField);
  
  if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
    Object.keys(parentValue).forEach(key => {
      nestedFields.add(`${parentField}.${key}`);
    });
  }
  
  // Convertir en tableau et trier par ordre alphabétique
  return Array.from(nestedFields).sort((a, b) => a.localeCompare(b));
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function FieldSelector({ 
  allFields, 
  currentValue, 
  onChange, 
  name, 
  placeholder,
  inputData 
}: {
  allFields: string[];
  currentValue?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  placeholder: string;
  inputData: any[] | null;
}) {
  const [showNestedFields, setShowNestedFields] = useState<boolean>(false);
  const [nestedFields, setNestedFields] = useState<string[]>([]);
  
  useEffect(() => {
    if (inputData && currentValue) {
      const nested = getNestedFields(inputData, currentValue);
      setNestedFields(nested);
      setShowNestedFields(nested.length > 0);
    } else {
      setShowNestedFields(false);
    }
  }, [currentValue, inputData]);
  
  return (
    <div className="field-selector mb-2">
      <select
        name={name}
        value={currentValue || ''}
        onChange={(e) => {
          onChange(e);
          // Si on a des champs imbriqués, montrer le sélecteur de champs imbriqués
          if (inputData) {
            const nested = getNestedFields(inputData, e.target.value);
            setNestedFields(nested);
            setShowNestedFields(nested.length > 0);
          }
        }}
        className="p-2 border rounded w-full"
      >
        <option value="">{placeholder}</option>
        {allFields.map(field => (
          <option key={field} value={field}>{field}</option>
        ))}
      </select>
      
      {showNestedFields && nestedFields.length > 0 && (
        <div className="nested-fields mt-2">
          <select
            name={name}
            value={currentValue}
            onChange={onChange}
            className="p-2 border rounded w-full bg-gray-50"
          >
            <option value="">Sélectionner un champ imbriqué (optionnel)</option>
            {nestedFields.map(field => (
              <option key={field} value={field}>{field.replace(`${currentValue}.`, '')}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function sortObjectKeys(obj: any): any {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    
    // Récupère les clés et les trie alphabétiquement
    const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
    
    // Crée un nouvel objet avec les clés triées
    const sortedObj: any = {};
    sortedKeys.forEach(key => {
      // Applique récursivement le tri aux objets imbriqués
      sortedObj[key] = typeof obj[key] === 'object' && !Array.isArray(obj[key]) 
        ? sortObjectKeys(obj[key]) 
        : obj[key];
    });
    
    return sortedObj;
  }

interface SortableBlockProps {
  block: Block;
  onChange: (block: Block) => void;
  onDelete: (id: string) => void;
  allFields: string[];
  inputData: any[] | null;
  isDraggingThis?: boolean;
}

function SortableBlock({ 
  block, 
  onChange, 
  onDelete, 
  allFields,
  inputData,
  isDraggingThis
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    animateLayoutChanges: () => false,
  });

  const blockRef = React.useRef<HTMLDivElement>(null);

    
  // Effectuer la mesure initiale au montage du composant
  React.useEffect(() => {
    if (!blockRef.current) return;
    
    if (isDragging) {
      // Enregistrer les dimensions originales avant de commencer à glisser
      const height = blockRef.current.offsetHeight;
      const width = blockRef.current.offsetWidth;
      
      // Appliquer ces dimensions exactes pendant le glissement
      blockRef.current.style.height = `${height}px`;
      blockRef.current.style.width = `${width}px`;
      blockRef.current.style.minHeight = `${height}px`;
      blockRef.current.style.minWidth = `${width}px`;
      blockRef.current.style.maxHeight = `${height}px`;
      blockRef.current.style.maxWidth = `${width}px`;
      blockRef.current.style.overflow = 'hidden';
      blockRef.current.style.backgroundColor = '#f3f4f6'; // Gris clair
      blockRef.current.style.transition = 'none';
    } else {
      // Réinitialiser les styles après le drag
      blockRef.current.style.height = '';
      blockRef.current.style.width = '';
      blockRef.current.style.minHeight = '';
      blockRef.current.style.minWidth = '';
      blockRef.current.style.maxHeight = '';
      blockRef.current.style.maxWidth = '';
      blockRef.current.style.overflow = '';
      blockRef.current.style.backgroundColor = '';
      blockRef.current.style.transition = '';
    }
  }, [isDragging]);
      
    
   
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '8px',
    backgroundColor: 'white',
    position: 'relative' as const,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none',
    willChange: 'transform',
  };
    // Rendu spécial si le bloc est en cours de déplacement
    if (isDraggingThis) {
        return (
          <div
            ref={setNodeRef}
            style={{
              opacity: 0.2,
              border: '1px dashed #ccc',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '8px',
              height: '120px',
            }}
          />
        );
      }
      
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      onChange({ 
        ...block, 
        config: { 
          ...block.config, 
          [target.name]: target.checked 
        } 
      });
    } else {
      onChange({ 
        ...block, 
        config: { 
          ...block.config, 
          [e.target.name]: e.target.value 
        } 
      });
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
      className={isDragging ? 'block-dragging' : ''}
    >
      <div
        {...listeners}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#f3f4f6',
          padding: '8px 12px',
          marginBottom: '8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <strong>{block.type.toUpperCase()}</strong>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(block.id);
        }}
        className="text-red-500 text-sm"
        style={{
          position: 'absolute',
          top: '24px',
          right: '18px',
          border: 'none',
          cursor: 'pointer',
        }}
        aria-label="Supprimer"
      >
        🗑️
      </button>
          
      <div style={{ marginTop: '8px' }}>
        {isDragging ? (
          <div style={{ textAlign: 'center', color: '#999' }}>🟦 En cours de déplacement...</div>
        ) : (
          <>
            {block.type === 'sort' && (
              <>
                <FieldSelector
                  allFields={allFields}
                  currentValue={block.config.field}
                  onChange={handleChange}
                  name="field"
                  placeholder="Sélectionner un champ à trier"
                  inputData={inputData}
                />
                <select
                  name="operator"
                  value={block.config.operator || ''}
                  onChange={handleChange}
                  className="p-2 border rounded w-full mb-2"
                >
                  <option value="">Ordre de tri</option>
                  <option value="asc">⬆️ Ascendant (A-Z / 0-9)</option>
                  <option value="desc">⬇️ Descendant (Z-A / 9-0)</option>
                </select>
              </>
            )}
            {block.type === 'filter' && (
              <>
                <FieldSelector
                  allFields={allFields}
                  currentValue={block.config.field}
                  onChange={handleChange}
                  name="field"
                  placeholder="Sélectionner un champ"
                  inputData={inputData}
                />
                <select
                  name="operator"
                  value={block.config.operator || ''}
                  onChange={handleChange}
                  className="p-2 border rounded w-full mb-2"
                >
                  <option value="">Sélectionner un opérateur</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value="==">=</option>
                  <option value="!=">!=</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                </select>
                <input 
                  name="value" 
                  placeholder="Valeur" 
                  value={block.config.value || ''} 
                  onChange={handleChange} 
                  className="p-2 border rounded w-full"
                />
              </>
            )}
            {block.type === 'map' && (
              <>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Champ source
                  </label>
                  <FieldSelector
                    allFields={allFields}
                    currentValue={block.config.field}
                    onChange={handleChange}
                    name="field"
                    placeholder="Sélectionner un champ source"
                    inputData={inputData}
                  />
                </div>
                
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du nouveau champ
                  </label>
                  <input 
                    name="newField" 
                    placeholder="Ex: prixTotal, nomComplet..." 
                    value={block.config.newField || ''} 
                    onChange={handleChange} 
                    className="p-2 border rounded w-full"
                  />
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`keepNested-${block.id}`}
                      name="keepNestedStructure"
                      checked={block.config.keepNestedStructure || false}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor={`keepNested-${block.id}`} className="text-sm text-gray-700">
                      Maintenir la structure imbriquée
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Si coché, le nouveau champ sera créé dans la même structure que le champ source
                  </p>
                </div>
                
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transformation (facultatif)
                  </label>
                  <select
                    name="transform"
                    value={block.config.transform || ''}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                  >
                    <option value="">Aucune transformation</option>
                    <option value="uppercase">Majuscules (TEXTE)</option>
                    <option value="lowercase">Minuscules (texte)</option>
                    <option value="number">Convertir en nombre</option>
                    <option value="string">Convertir en texte</option>
                    <option value="round">Arrondir</option>
                    <option value="math">Formule mathématique</option>
                    <option value="format">Formater</option>
                    <option value="extract">Extraire une partie</option>
                  </select>
                </div>
                
                {block.config.transform === 'math' && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Formule mathématique
                    </label>
                    <input 
                      name="transformOption" 
                      placeholder="Ex: value * 2, value + 10" 
                      value={block.config.transformOption || ''} 
                      onChange={handleChange} 
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Utilisez 'value' pour la valeur du champ. Ex: value * 2
                    </p>
                  </div>
                )}
                
                {block.config.transform === 'format' && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <input 
                      name="transformOption" 
                      placeholder="Ex: Préfixe {value} Suffixe" 
                      value={block.config.transformOption || ''} 
                      onChange={handleChange} 
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Utilisez {'{value}'} pour insérer la valeur du champ
                    </p>
                  </div>
                )}
                
                {block.config.transform === 'extract' && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extraction
                    </label>
                    <input 
                      name="transformOption" 
                      placeholder="Ex: 0:5 (premiers 5 caractères)" 
                      value={block.config.transformOption || ''} 
                      onChange={handleChange} 
                      className="p-2 border rounded w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: début:fin ou index
                    </p>
                  </div>
                )}
                
                {block.config.transform === 'round' && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Décimales
                    </label>
                    <input 
                      name="transformOption" 
                      placeholder="Nombre de décimales (0-10)" 
                      type="number"
                      min="0"
                      max="10"
                      value={block.config.transformOption || ''}
                      onChange={handleChange} 
                      className="p-2 border rounded w-full"
                    />
                  </div>
                )}
              </>
            )}
            {block.type === 'convert' && (
              <select
                name="format"
                value={block.config.format || ''}
                onChange={handleChange}
                className="p-2 border rounded w-full"
              >
                <option value="">Sélectionner un format</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Fonction pour appliquer des transformations aux valeurs
function transformValue(value: any, transform: string | undefined, option: string | undefined): any {
  if (!transform) return value;
  
  // Conversion préalable pour assurer que nous avons un type correct
  let processedValue = value;
  
  switch (transform) {
    case 'uppercase':
      return String(processedValue).toUpperCase();
    
    case 'lowercase':
      return String(processedValue).toLowerCase();
    
    case 'number':
      return Number(processedValue);
    
    case 'string':
      return String(processedValue);
    
    case 'round':
      if (isNaN(Number(processedValue))) return processedValue;
      const decimals = option ? parseInt(option) : 0;
      return Number(processedValue).toFixed(decimals);
    
    case 'math':
      if (!option) return processedValue;
      if (isNaN(Number(processedValue))) return processedValue;
      
      try {
        // Utilise la fonction eval de manière sécurisée pour évaluer l'expression mathématique
        // en remplaçant 'value' par la valeur réelle
        const numericValue = Number(processedValue);
        const mathExpression = option.replace(/value/g, numericValue.toString());
        return eval(mathExpression);
      } catch (error) {
        console.error("Erreur dans l'expression mathématique:", error);
        return processedValue;
      }
    
    case 'format':
      if (!option) return processedValue;
      // Remplace {value} par la valeur réelle
      return option.replace(/\{value\}/g, String(processedValue));
    
    case 'extract':
      if (!option) return processedValue;
      const stringValue = String(processedValue);
      
      if (option.includes(':')) {
        // Format début:fin pour extraire une sous-chaîne
        const [start, end] = option.split(':').map(n => parseInt(n));
        return stringValue.substring(start, end);
      } else {
        // Format index pour extraire un caractère spécifique
        const index = parseInt(option);
        return stringValue.charAt(index);
      }
    
    default:
      return processedValue;
  }
}

function applyPipeline(data: any[], blocks: Block[]) {
    const processedData = blocks.reduce((currentData, block) => {
    switch (block.type) {
      case 'filter': {
        const { field, operator, value } = block.config;
        if (!field || !operator || value === undefined) return currentData;
        return currentData.filter(item => {
          const itemVal = getNestedValue(item, field);
          const parsedVal = isNaN(Number(value)) ? value : Number(value);
          const parsedItemVal = isNaN(Number(itemVal)) ? itemVal : Number(itemVal);

          switch (operator) {
            case '>': return parsedItemVal > parsedVal;
            case '<': return parsedItemVal < parsedVal;
            case '==': return parsedItemVal === parsedVal;
            case '!=': return parsedItemVal !== parsedVal;
            case '>=': return parsedItemVal >= parsedVal;
            case '<=': return parsedItemVal <= parsedVal;
            default: return true;
          }
        });
      }
      case 'map': {
        const { field, newField, transform, transformOption, keepNestedStructure } = block.config;
        if (!field || !newField) return currentData;
        
        return currentData.map(item => {
          // Récupère la valeur du champ source
          const originalValue = getNestedValue(item, field);
          
          // Applique la transformation si elle est définie
          const transformedValue = transformValue(originalValue, transform, transformOption);
          
          // Clone l'objet pour éviter de modifier l'original
          const result = { ...item };
          
          // Si l'option "maintenir la structure imbriquée" est activée
          if (keepNestedStructure) {
            // Détermine le chemin d'imbrication
            const pathParts = field.split('.');
            
            // Si le champ n'est pas imbriqué, ajoute simplement le nouveau champ à la racine
            if (pathParts.length <= 1) {
              result[newField] = transformedValue;
            } else {
              // Obtient le parent (l'objet contenant le champ source)
              const parentPath = pathParts.slice(0, -1).join('.');
              const parentObj = getNestedValue(result, parentPath);
              
              // Si le parent existe, ajoute le nouveau champ à cet objet
              if (parentObj && typeof parentObj === 'object') {
                // Crée une copie pour éviter la modification par référence
                const newParent = { ...parentObj };
                newParent[newField] = transformedValue;
                
                // Met à jour l'objet parent dans le résultat
                setNestedValue(result, parentPath, newParent);
              } else {
                // Si le parent n'existe pas, revient au comportement par défaut
                result[newField] = transformedValue;
              }
            }
          } else {
            // Comportement par défaut: ajoute simplement le nouveau champ à la racine
            result[newField] = transformedValue;
          }
          
          return result;
        });
      }
      case 'convert': {
        const { format } = block.config;
        if (format === 'csv') {
          if (currentData.length === 0) return currentData;
          const keys = Object.keys(currentData[0] || {});
          const rows = currentData.map(obj => keys.map(k => obj[k]).join(','));
          return [keys.join(','), ...rows];
        }
        return currentData;
      }

      case 'sort': {
        const { field, operator } = block.config;
        if (!field || !operator) return currentData;
        return [...currentData].sort((a, b) => {
          const aVal = getNestedValue(a, field);
          const bVal = getNestedValue(b, field);

          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return operator === 'asc' ? aVal - bVal : bVal - aVal;
          } else {
            return operator === 'asc'
              ? String(aVal).localeCompare(String(bVal))
              : String(bVal).localeCompare(String(aVal));
          }
        });
      }
      default:
        return currentData;
    }
  }, data);

  return processedData.map(item => sortObjectKeys(item));
}

// Fonction pour définir une valeur dans un objet imbriqué
function setNestedValue(obj: any, path: string, value: any): void {
  const pathParts = path.split('.');
  let current = obj;
  
  // Parcourt le chemin sauf le dernier élément
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    
    // Si le chemin n'existe pas, crée un objet vide
    if (current[part] === undefined) {
      current[part] = {};
    }
    
    current = current[part];
  }
  
  // Définit la valeur dans le dernier niveau
  const lastPart = pathParts[pathParts.length - 1];
  current[lastPart] = value;
}

// Composant principal
function BlockEditor() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [inputData, setInputData] = useState<any[]>([]);
  const [outputData, setOutputData] = useState<any>(null);
  const [allFields, setAllFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (inputData && inputData.length > 0) {
      // Extrait et trie les champs par ordre alphabétique
      const fields = extractAllFields(inputData);
      setAllFields(fields);
    }
  }, [inputData]);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      body.dragging {
        cursor: grabbing !important;
        user-select: none;
      }
      body.dragging * {
        cursor: grabbing !important;
      }
      
      /* Cette règle est cruciale pour fixer la largeur pendant le drag */
      [data-dnd-draggable] {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        transform-origin: 50% 50% !important;
        transition: transform 120ms ease-out !important;
        transition-property: transform !important;
      }
      
      /* Styles pour l'élément en cours de déplacement */
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
  

  const addBlock = (type: BlockType) => {
    setBlocks([...blocks, { id: uuidv4(), type, config: {} }]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
    document.body.classList.add('dragging');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false);
    document.body.classList.remove('dragging');
    
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      setBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const handleBlockChange = (updatedBlock: Block) => {
    setBlocks(blocks.map(b => (b.id === updatedBlock.id ? updatedBlock : b)));
  };

  const handleBlockDelete = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          const data = Array.isArray(parsed) ? parsed : [parsed];
          setInputData(data);
          setOutputData(data);
          setAllFields(extractAllFields(data));
        } else if (file.name.endsWith('.csv')) {
          const [headerLine, ...lines] = content.split(/\r?\n/).filter(line => line.trim());
          const headers = headerLine.split(',');
          const data = lines.map(line => {
            const values = line.split(',');
            return headers.reduce((obj, key, i) => {
              obj[key] = values[i];
              return obj;
            }, {} as Record<string, string>);
          });
          setInputData(data);
          setOutputData(data);
          setAllFields(extractAllFields(data));
        }
      } catch (err) {
        alert('Erreur de lecture du fichier');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };


  const handleRunLocally = () => {
    if (!inputData || inputData.length === 0) return alert("Pas de données d'entrée");
    
    setIsLoading(true);
    
    try {
      const result = applyPipeline(inputData, blocks);
      setOutputData(result);
    } catch (error) {
      console.error("Erreur lors de l'exécution du pipeline:", error);
      alert(`Erreur lors de l'exécution du pipeline: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧱 Éditeur de Pipeline</h1>

      <div className="mb-4 p-4 border rounded bg-gray-50">
        <label className="block mb-2 font-medium">📂 Charger un fichier CSV ou JSON</label>
        <input 
          type="file" 
          accept=".json,.csv" 
          onChange={handleFileUpload} 
          className="block"
          disabled={isLoading || isDragging}
        />
      </div>

      {/* Vos boutons pour ajouter des blocs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {BLOCK_TYPES.map(type => (
          <button
            key={type}
            onClick={() => addBlock(type)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            disabled={isLoading || isDragging}
          >
            Ajouter {type}
          </button>
        ))}
      </div>

      {/* Votre indicateur de chargement */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Traitement en cours...</p>
        </div>
      )}

      {/* Votre contexte de drag and drop */}
      <DndContext 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={blocks.map(b => b.id)} 
          strategy={verticalListSortingStrategy}
        >
          {blocks.map(block => (
            <SortableBlock
              key={block.id}
              block={block}
              onChange={handleBlockChange}
              onDelete={handleBlockDelete}
              allFields={allFields}
              inputData={inputData}
              isDraggingThis={activeId === block.id}
            />
          ))}
        </SortableContext>
        
        <DragOverlay>
          {activeId ? (
            <div className="block-drag-preview" style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              boxShadow: '0 5px 10px rgba(0,0,0,0.15)',
            }}>
              <div style={{
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '12px',
                backgroundColor: '#e5e7eb',
              }}>
                <strong>{blocks.find(b => b.id === activeId)?.type.toUpperCase()}</strong>
              </div>
              <div style={{ textAlign: 'center', color: '#666' }}>
                🟦 En cours de déplacement...
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Bouton pour exécuter le pipeline */}
      {blocks.length > 0 && (
        <button
          onClick={handleRunLocally}
          className="mt-6 w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          disabled={isLoading || isDragging}
        >
          ⚙️ Exécuter localement le pipeline
        </button>
      )}

      {/* Aperçu du pipeline et données */}
      {blocks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 border rounded">
          <h2 className="font-semibold mb-2">📄 Pipeline JSON (aperçu)</h2>
          <pre className="text-sm overflow-auto max-h-64 bg-white p-2 rounded">
            {JSON.stringify(blocks, null, 2)}
          </pre>
        </div>
      )}

      {inputData && inputData.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 border rounded">
          <h2 className="font-semibold mb-2">📥 Données d'entrée</h2>
          <pre className="text-sm overflow-auto max-h-64 bg-white p-2 rounded">
            {JSON.stringify(inputData, null, 2)}
          </pre>
        </div>
      )}

      {outputData && (
        <div className="mt-6 p-4 bg-gray-100 border rounded">
          <h2 className="font-semibold mb-2">📤 Résultat du pipeline</h2>
          <pre className="text-sm overflow-auto max-h-64 bg-white p-2 rounded">
            {JSON.stringify(outputData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
export default BlockEditor;