import React, { useState, useEffect, useMemo } from 'react';

const ActivityFilters = ({ activities = [], onFilterChange }) => {
  const [filters, setFilters] = useState({
    activityType: '',
    dateFrom: '',
    dateTo: ''
  });

  // Filter activities based on current filters
  const filteredActivities = useMemo(() => {
    if (!activities.length) return [];

    const filtered = activities.filter(activity => {
      // Filter by activity type
      if (filters.activityType && activity.type !== filters.activityType) {
        return false;
      }

      // Date range filtering
      if (filters.dateFrom || filters.dateTo) {
        const activityDate = new Date(activity.timestamp || activity.createdAt);
        
        // Convert filter dates to Date objects for proper comparison
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
        
        // Set to end of day for toDate to include the entire day
        if (toDate) {
          toDate.setHours(23, 59, 59, 999);
        }

        // Check if activity is within date range
        if (fromDate && activityDate < fromDate) {
          return false;
        }

        if (toDate && activityDate > toDate) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }, [filters, activities]);

  // Notify parent when filtered activities change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredActivities);
    }
  }, [filteredActivities, onFilterChange]);

  // Activity types configuration
  const activityTypes = [
    { value: '', label: 'All Activity Types' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'user_registered', label: 'User Registration' },
    { value: 'login_failed', label: 'Failed Logins' },
    { value: 'booking_status_updated', label: 'Booking Status Updates' },
    { value: 'profile_updated', label: 'Profile Updates' },
    { value: 'password_changed', label: 'Password Changes' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      activityType: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Get today's date for max date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Filter Activities</h3>
          <p className="text-sm text-gray-500 mt-1">
            {activities.length > 0 
              ? `Showing ${filteredActivities.length} of ${activities.length} activities`
              : 'No activities available'
            }
            {filters.activityType && ` • Type: ${activityTypes.find(t => t.value === filters.activityType)?.label}`}
            {(filters.dateFrom || filters.dateTo) && ` • Date: ${filters.dateFrom || 'Start'} to ${filters.dateTo || 'End'}`}
          </p>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Activity Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Type
          </label>
          <select 
            value={filters.activityType}
            onChange={(e) => handleFilterChange('activityType', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date From
          </label>
          <input 
            type="date" 
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            max={filters.dateTo || today}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white" 
          />
        </div>
        
        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date To
          </label>
          <input 
            type="date" 
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            min={filters.dateFrom}
            max={today}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white" 
          />
        </div>
      </div>

      {/* Date Range Quick Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-700 mr-2">Quick date filters:</span>
        <button
          onClick={() => {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            
            setFilters(prev => ({
              ...prev,
              dateFrom: sevenDaysAgo.toISOString().split('T')[0],
              dateTo: today.toISOString().split('T')[0]
            }));
          }}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            setFilters(prev => ({
              ...prev,
              dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
              dateTo: today.toISOString().split('T')[0]
            }));
          }}
          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          Last 30 Days
        </button>
        <button
          onClick={() => {
            const today = new Date();
            setFilters(prev => ({
              ...prev,
              dateFrom: today.toISOString().split('T')[0],
              dateTo: today.toISOString().split('T')[0]
            }));
          }}
          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => {
            handleFilterChange('dateFrom', '');
            handleFilterChange('dateTo', '');
          }}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Dates
        </button>
      </div>

      {/* Activity Type Quick Filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-sm text-gray-700 mr-2">Quick activity filters:</span>
        <button
          onClick={() => handleFilterChange('activityType', 'booking_status_updated')}
          className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
        >
          Booking Updates
        </button>
        <button
          onClick={() => handleFilterChange('activityType', 'login_failed')}
          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Failed Logins
        </button>
        <button
          onClick={() => handleFilterChange('activityType', 'login')}
          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          Logins
        </button>
        <button
          onClick={() => handleFilterChange('activityType', '')}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Type
        </button>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {filters.activityType && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Type: {activityTypes.find(t => t.value === filters.activityType)?.label}
                <button 
                  onClick={() => handleFilterChange('activityType', '')}
                  className="ml-2 hover:text-blue-600 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                From: {filters.dateFrom}
                <button 
                  onClick={() => handleFilterChange('dateFrom', '')}
                  className="ml-2 hover:text-purple-600 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                To: {filters.dateTo}
                <button 
                  onClick={() => handleFilterChange('dateTo', '')}
                  className="ml-2 hover:text-purple-600 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Results Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Filter Results:</strong> Found {filteredActivities.length} activities matching your criteria
            {filters.activityType && ` • Type: ${activityTypes.find(t => t.value === filters.activityType)?.label}`}
            {filters.dateFrom && filters.dateTo && ` • Date Range: ${filters.dateFrom} to ${filters.dateTo}`}
            {filters.dateFrom && !filters.dateTo && ` • From: ${filters.dateFrom}`}
            {!filters.dateFrom && filters.dateTo && ` • Until: ${filters.dateTo}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFilters;