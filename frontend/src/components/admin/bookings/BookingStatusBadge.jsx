// src/components/admin/bookings/BookingStatusBadge.jsx - UPDATED FOR BACKEND COMPATIBILITY
import React from "react";

// ============================================================================
// 🎯 UPDATED STATUS CONFIGURATION - MATCHING BACKEND SUPPORT
// ============================================================================
const statusConfig = {
  pending: {
    label: "Pending",
    styles: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: "⏳",
    description: "Booking is pending confirmation"
  },
  confirmed: {
    label: "Confirmed", 
    styles: "bg-green-50 text-green-700 border border-green-200",
    icon: "✅",
    description: "Booking has been confirmed"
  },
  cancelled: {
    label: "Cancelled",
    styles: "bg-red-50 text-red-700 border border-red-200", 
    icon: "❌",
    description: "Booking has been cancelled"
  },
  requested: {
    label: "Cancellation Requested",
    styles: "bg-amber-50 text-amber-800 border border-amber-200",
    icon: "⚠️",
    description: "Client has requested cancellation — admin review needed"
  },
  // 🛠️ NOTE: Backend doesn't currently support 'completed' status
  // Uncomment when backend adds support for completed status
  /*
  completed: {
    label: "Completed",
    styles: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: "🎉",
    description: "Booking has been completed"
  }
  */
};

const BookingStatusBadge = ({ status, showTooltip = false }) => {
  // ============================================================================
  // 🎯 GET CONFIG FOR CURRENT STATUS WITH FALLBACK
  // ============================================================================
  const config = statusConfig[status] || {
    label: "Unknown",
    styles: "bg-gray-50 text-gray-600 border border-gray-200",
    icon: "❓",
    description: "Unknown booking status"
  };

  // ============================================================================
  // 🎯 COMPONENT RENDER
  // ============================================================================
  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${config.styles}`}
      title={showTooltip ? config.description : undefined} // 🛠️ ADD: Optional tooltip
      role="status" // 🛠️ ADD: Accessibility role
      aria-label={`Booking status: ${config.label}`} // 🛠️ ADD: Accessibility label
    >
      <span className="flex-shrink-0" aria-hidden="true">{config.icon}</span>
      <span className="font-medium">{config.label}</span>
    </span>
  );
};

export default BookingStatusBadge;