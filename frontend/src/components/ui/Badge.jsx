import React from 'react';

const Badge = ({ children, variant = 'primary', className = "" }) => {
  const variants = {
    primary: "bg-primary-50 text-primary-700 border-primary-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-blue-50 text-blue-700 border-blue-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-platinum-100 text-slate-700 border-platinum-300",
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${variants[variant] || variants.neutral}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;
