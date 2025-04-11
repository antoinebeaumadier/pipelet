import React, { useState, useEffect } from 'react';
import { FieldSelectorProps } from '../BlockEditor/types';
import { getNestedFields } from '../../utils/dataUtils';

const FieldSelector: React.FC<FieldSelectorProps> = ({
  allFields,
  currentValue,
  onChange,
  name,
  placeholder,
  inputData,
  className = "",
}) => {
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
    <div className={className}>
      <select
        name={name}
        value={currentValue || ""}
        onChange={(e) => {
          onChange(e);
          // If we have nested fields, show the nested field selector
          if (inputData) {
            const nested = getNestedFields(inputData, e.target.value);
            setNestedFields(nested);
            setShowNestedFields(nested.length > 0);
          }
        }}
      >
        <option value="">{placeholder}</option>
        {allFields.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>

      {showNestedFields && nestedFields.length > 0 && (
        <select
          name={name}
          value={currentValue}
          onChange={onChange}
        >
          <option value="">Select nested field (optional)</option>
          {nestedFields.map((field) => (
            <option key={field} value={field}>
              {field.replace(`${currentValue}.`, "")}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default FieldSelector;