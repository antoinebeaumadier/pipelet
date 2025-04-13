import React from "react";

interface FieldSelectorProps {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  fields?: string[];
  placeholder?: string;
  style?: React.CSSProperties;
  allFields?: string[];
  currentValue?: string;
  name?: string;
  inputData?: any[] | null;
  className?: string;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({
  value,
  onChange,
  fields,
  placeholder = "Select a field",
  style,
  allFields,
  currentValue,
  name,
  inputData,
  className,
}) => {
  const selectedValue = value ?? currentValue ?? "";
  const availableFields = fields ?? allFields ?? [];
  const selectName = name ?? "";

  return (
    <div style={{ position: "relative" }}>
      <select
        name={selectName}
        value={selectedValue}
        onChange={onChange}
        className={`${className} square-select`}
        style={style}
      >
        <option value="">{placeholder}</option>
        {availableFields.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FieldSelector;