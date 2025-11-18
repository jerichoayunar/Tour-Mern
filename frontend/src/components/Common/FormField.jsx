// src/components/Common/FormField.jsx
import React from 'react';

const FormField = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  ...props
}) => {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`form-input ${error ? 'error' : ''}`}
        {...props}
      />

      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormField; // ✅ MUST be present
