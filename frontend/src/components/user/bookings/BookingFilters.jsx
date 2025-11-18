// src/components/bookings/BookingFilters.jsx
import React from 'react';
import './BookingFilters.css';

const BookingFilters = ({ filters, onFilterChange, onClearFilters, isAdmin = false }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value !== undefined && value !== ''
  );

  return (
    <div className="booking-filters">
      <h3 className="filters-title">Filter Bookings</h3>
      
      {isAdmin && (
        <div className="filter-group">
          <label className="filter-label">Search Client</label>
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>
      )}

      <div className="filter-group">
        <label className="filter-label">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">From Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">To Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button 
          className="clear-filters-btn"
          onClick={handleClearFilters}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default BookingFilters;