import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Filter } from 'lucide-react';

const DestinationFilters = ({ 
  filters, 
  onFiltersChange, 
  availableLocations = [],
  className = '' 
}) => {
  const [_selectedLocations, setSelectedLocations] = useState([]);

  // Define getSortLabel first
  const getSortLabel = (sortBy) => {
    const labels = {
      'name': 'A-Z',
      'nameDesc': 'Z-A',
      'location': 'Location',
      'newest': 'Newest',
      'oldest': 'Oldest'
    };
    return labels[sortBy] || sortBy;
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleLocationSelect = (location) => {
    if (location === '') {
      // Clear all locations
      setSelectedLocations([]);
      handleFilterChange('location', '');
    } else {
      // Single location selection (like dropdown)
      setSelectedLocations([location]);
      handleFilterChange('location', location);
    }
  };

  // Calculate active filters for display
  const activeFilters = useMemo(() => {
    const active = [];
    if (filters.search) active.push({ type: 'search', label: `"${filters.search}"` });
    if (filters.location) active.push({ type: 'location', label: filters.location });
    if (filters.status && filters.status !== 'active') {
      active.push({ 
        type: 'status', 
        label: filters.status === 'inactive' ? 'Coming Soon' : 'All Status' 
      });
    }
    if (filters.sortBy && filters.sortBy !== 'name') {
      active.push({ 
        type: 'sort', 
        label: getSortLabel(filters.sortBy) 
      });
    }
    return active;
  }, [filters]);

  const clearFilter = (filterType) => {
    const newFilters = { ...filters };
    
    switch (filterType) {
      case 'search':
        newFilters.search = '';
        break;
      case 'location':
        setSelectedLocations([]);
        newFilters.location = '';
        break;
      case 'status':
        newFilters.status = 'active';
        break;
      case 'sort':
        newFilters.sortBy = 'name';
        break;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setSelectedLocations([]);
    onFiltersChange({ 
      search: '', 
      location: '', 
      status: 'active', 
      sortBy: 'name'
    });
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 ${className}`}>
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search destinations, locations..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-gray-50 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Location Filter - Clean Dropdown */}
          <div className="relative">
            <select
              value={filters.location || ''}
              onChange={(e) => handleLocationSelect(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">All Locations</option>
              {availableLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { value: 'active', label: 'Available' },
              { value: 'inactive', label: 'Coming Soon' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('status', option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filters.status === option.value
                    ? 'bg-white text-gray-900 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="name">Sort: A-Z</option>
              <option value="nameDesc">Sort: Z-A</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Active filters:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, _index) => (
                <button
                  key={`${filter.type}-${_index}`}
                  onClick={() => clearFilter(filter.type)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 group border ${
                    filter.type === 'search' 
                      ? 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100'
                      : filter.type === 'location'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                      : filter.type === 'status'
                      ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                      : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                  }`}
                >
                  <span>{filter.label}</span>
                  <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors duration-200 whitespace-nowrap ml-auto"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationFilters;