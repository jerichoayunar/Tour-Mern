// src/components/ui/Loader.jsx
import React from "react";

const Loader = ({ size = "md" }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-3",
    lg: "h-8 w-8 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizes[size]}`}
    ></div>
  );
};

export default Loader;
