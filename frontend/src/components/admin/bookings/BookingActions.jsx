import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../../ui/Button";

const BookingActions = ({ 
  booking, 
  onViewDetails, 
  onStatusUpdate,
  isArchived = false,
  onArchive,
  onRestore,
  onDeletePermanent
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === booking.status) return;
    setShowDropdown(false);
    await onStatusUpdate(booking._id, newStatus);
  };

  const handleArchiveClick = () => {
    setShowDropdown(false);
    onArchive(booking);
  };

  const handleRestoreClick = () => {
    setShowDropdown(false);
    onRestore(booking);
  };

  const handleDeleteClick = () => {
    setShowDropdown(false);
    onDeletePermanent(booking);
  };

  // Define available actions based on archive status
  let actions = [];

  if (isArchived) {
    actions = [
      { 
        label: "♻️ Restore Booking", 
        onClick: handleRestoreClick,
        color: "text-green-600 hover:bg-green-50" 
      },
      { 
        label: "🗑️ Delete Permanently", 
        onClick: handleDeleteClick,
        color: "text-red-600 hover:bg-red-50" 
      }
    ];
  } else {
    // Standard status updates
    const statusActions = [
      { value: "pending", label: "⏳ Mark as Pending", color: "text-yellow-600 hover:bg-yellow-50" },
      { value: "confirmed", label: "✅ Confirm Booking", color: "text-green-600 hover:bg-green-50" },
      { value: "cancelled", label: "❌ Cancel Booking", color: "text-red-600 hover:bg-red-50" },
    ].filter((s) => s.value !== booking.status).map(s => ({
      label: s.label,
      onClick: () => handleStatusChange(s.value),
      color: s.color
    }));

    actions = [
      ...statusActions,
      { 
        label: "📦 Archive Booking", 
        onClick: handleArchiveClick,
        color: "text-gray-600 hover:bg-gray-50 border-t border-gray-100" 
      }
    ];
  }

  const dropdown = showDropdown ? (
    <div
      ref={dropdownRef}
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]"
      style={{
        position: "absolute",
        top: buttonRef.current?.getBoundingClientRect().bottom + window.scrollY + 4,
        left: buttonRef.current?.getBoundingClientRect().left + window.scrollX,
      }}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${action.color} first:rounded-t-lg last:rounded-b-lg`}
        >
          {action.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className="flex items-center justify-end space-x-2 relative">
      {/* View Details Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewDetails(booking)}
        className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 px-3 py-2 transition-colors duration-200"
      >
        👁️ View
      </Button>

      {/* Actions Dropdown Button */}
      <Button
        ref={buttonRef}
        size="sm"
        variant="primary"
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-1 px-3 py-2 transition-colors duration-200 shadow-sm"
      >
        <span>⚡</span>
        <span>Actions</span>
      </Button>

      {/* Dropdown Portal */}
      {showDropdown && createPortal(dropdown, document.body)}
    </div>
  );
};

export default BookingActions;