import React from "react";

const colorVariants = {
  blue: "border-l-4 border-blue-500",
  green: "border-l-4 border-green-500",
  yellow: "border-l-4 border-yellow-500",
  purple: "border-l-4 border-purple-500",
  red: "border-l-4 border-red-500",
};

const AdminStatsCard = ({
  title,
  value,
  change,
  trend,
  icon,
  color = "blue",
  onClick,
  loading = false,
}) => {
  const isPositive = change >= 0;
  const changeType =
    change !== undefined
      ? isPositive
        ? "text-green-500"
        : "text-red-500"
      : "text-gray-500";

  const formatChange = (c) => `${isPositive ? "+" : ""}${c}%`;

  const handleClick = () => {
    if (onClick && !loading) onClick();
  };

  // 🦴 Loading skeleton
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg" />
          <div className="flex flex-col flex-1 gap-2">
            <div className="h-3 w-3/5 bg-gray-100 rounded" />
            <div className="h-6 w-2/5 bg-gray-100 rounded" />
            <div className="h-3 w-4/5 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : -1}
      onClick={handleClick}
      className={`relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-300 overflow-hidden
        ${colorVariants[color] || colorVariants.blue}
        ${onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-500" : ""}
      `}
    >
      <div className="relative z-10 flex items-center gap-4">
        {/* ICON */}
        <div className="flex-shrink-0 text-4xl text-gray-600">{icon}</div>

        {/* INFO */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            {title}
          </h3>
          <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>

          <div className={`flex items-center gap-2 text-sm font-medium ${changeType}`}>
            {change !== undefined ? (
              <>
                <span>{isPositive ? "↗" : "↘"}</span>
                <span>{formatChange(change)} from last period</span>
              </>
            ) : trend ? (
              <span>{trend}</span>
            ) : null}
          </div>
        </div>

        {onClick && (
          <div className="ml-auto text-gray-400 text-xl transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-500">
            →
          </div>
        )}
      </div>

      {/* BG DECORATION */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-blue-50 rounded-tr-xl" />
    </div>
  );
};

export default AdminStatsCard;
