// src/components/admin/bookings/BookingFilters.jsx - SIMPLIFIED VERSION
import React from "react";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Button from "../../ui/Button";

const BookingFilters = ({ filters, onFilterChange, onReset }) => {
  // ============================================================================
  // 🎯 FILTER HANDLERS
  // ============================================================================
  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleReset = () => {
    onFilterChange({ 
      search: "", 
      status: "", 
      startDate: "", 
      endDate: "",
      guests: "",
      minAmount: "",
      maxAmount: ""
    });
    if (onReset) onReset();
  };

  // ============================================================================
  // 🎯 UPDATED STATUS OPTIONS - MATCHING BACKEND SUPPORT
  // ============================================================================
  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "⏳ Pending", value: "pending" },
    { label: "✅ Confirmed", value: "confirmed" },
    { label: "❌ Cancelled", value: "cancelled" },
    { label: "⚠️ Cancellation Requested", value: "requested" },
    // 🛠️ NOTE: Backend doesn't currently support 'completed' status
    // { label: "🎉 Completed", value: "completed" },
  ];

  // ============================================================================
  // 🎯 ACTIVE FILTERS CHECK
  // ============================================================================
  const hasActiveFilters = 
    filters.search || 
    filters.status || 
    filters.startDate || 
    filters.endDate || 
    filters.guests || 
    filters.minAmount || 
    filters.maxAmount;

  // ============================================================================
  // 🎯 COMPONENT RENDER - SIMPLIFIED
  // ============================================================================
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      {/* ==================================================================== */}
      {/* MAIN FILTERS ROW - CLEAN AND FOCUSED */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* SEARCH FILTER */}
        <div className="lg:col-span-2">
          <label htmlFor="search-bookings" className="block text-sm font-medium text-gray-700 mb-2">
            🔍 Search Bookings
          </label>
          <Input
            id="search-bookings"
            type="text"
            value={filters.search || ""}
            onChange={handleSearchChange}
            placeholder="Search by client name, email, or package title..."
            className="w-full"
            aria-describedby="search-help"
          />
          <p id="search-help" className="text-xs text-gray-500 mt-1">
            Searches: Client Name, Client Email, Package Title
          </p>
        </div>

        {/* STATUS FILTER */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            📊 Filter by Status
          </label>
          <Select
            id="status-filter"
            value={filters.status || ""}
            onChange={handleStatusChange}
            options={statusOptions}
            aria-label="Filter by booking status"
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* FILTER STATUS & ACTIONS - SIMPLIFIED */}
      {/* ==================================================================== */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 flex-1">
          {hasActiveFilters ? (
            <span className="text-blue-600 font-medium">
              ✅ Active Filters: 
              {filters.search && ` Search: "${filters.search}"`}
              {filters.status && ` Status: ${filters.status}`}
              {filters.startDate && ` From: ${filters.startDate}`}
              {filters.endDate && ` To: ${filters.endDate}`}
              {filters.guests && ` Guests: ${filters.guests}+`}
            </span>
          ) : (
            <span>📋 Showing all bookings</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="whitespace-nowrap"
            aria-label="Clear all filters"
          >
            🗑️ Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;