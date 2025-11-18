// src/components/ui/Input.jsx
import React from "react";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  className = "",
  ...props
}) => (
  <div className={`flex flex-col mb-3 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    )}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);

export default Input;
