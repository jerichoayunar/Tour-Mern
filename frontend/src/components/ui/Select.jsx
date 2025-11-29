// src/components/ui/Select.jsx - MODERN UI SYSTEM
import React, { forwardRef } from "react";
import clsx from "clsx";

const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = "Select an option",
  className = "",
  containerClassName = "",
  ...props
}, ref) => {
  const baseStyles =
    "w-full px-4 py-2.5 bg-bright-snow border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-mild-slate disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-10";

  const stateStyles = error
    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
    : "border-pale-slate focus:border-iron-grey focus:ring-mild-slate/20";

  const chevronIcon = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236c757d' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`;

  return (
    <div className={clsx("w-full", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-iron-grey mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(baseStyles, stateStyles, className)}
          style={{ backgroundImage: chevronIcon, backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-iron-grey">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
