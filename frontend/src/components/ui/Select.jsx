// src/components/ui/Select.jsx
import React from "react";

const Select = ({
  label,
  options = [],
  value,
  onChange,
  name,
  className = "",
  ...props
}) => (
  <div className={`flex flex-col mb-3 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    )}
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    >
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default Select;
