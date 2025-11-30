// src/components/user/packages/PackageFilters.jsx - UPDATED WITH PESO SYMBOL
import React, { useState } from 'react';
import { Search, X, Calendar } from 'lucide-react';

const PackageFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearAll, // optional handler passed from parent to clear filters globally
  className = '' 
}) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilter = (filterType) => {
    const newFilters = { ...localFilters };
    switch (filterType) {
      case 'search':
        newFilters.search = '';
        break;
      case 'priceRange':
        newFilters.minPrice = '';
        newFilters.maxPrice = '';
        break;
      case 'durationRange':
        newFilters.minDuration = '';
        newFilters.maxDuration = '';
        break;
    }
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      minPrice: '',
      maxPrice: '',
      minDuration: '',
      maxDuration: '',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    if (typeof onClearAll === 'function') onClearAll();
  };

  // Handle price range selection
  const handlePriceRangeChange = (value) => {
    let minPrice = '';
    let maxPrice = '';
    
    switch (value) {
      case '5000':
        minPrice = '0';
        maxPrice = '5000';
        break;
      case '10000':
        minPrice = '0';
        maxPrice = '10000';
        break;
      case '20000':
        minPrice = '0';
        maxPrice = '20000';
        break;
      case '50000':
        minPrice = '0';
        maxPrice = '50000';
        break;
      default:
        minPrice = '';
        maxPrice = '';
    }
    
    const newFilters = {
      ...localFilters,
      minPrice,
      maxPrice
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle duration range selection
  const handleDurationRangeChange = (value) => {
    let minDuration = '';
    let maxDuration = '';
    
    switch (value) {
      case '3':
        minDuration = '1';
        maxDuration = '3';
        break;
      case '7':
        minDuration = '4';
        maxDuration = '7';
        break;
      case '14':
        minDuration = '8';
        maxDuration = '14';
        break;
      case '30':
        minDuration = '15';
        maxDuration = '30';
        break;
      default:
        minDuration = '';
        maxDuration = '';
    }
    
    const newFilters = {
      ...localFilters,
      minDuration,
      maxDuration
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Calculate active filters for display
  const activeFilters = [];
  if (localFilters.search) activeFilters.push({ type: 'search', label: `"${localFilters.search}"` });
  
  // Price range filter
  if (localFilters.minPrice || localFilters.maxPrice) {
    let priceLabel = '';
    if (localFilters.maxPrice === '5000') priceLabel = 'Under ₱5,000';
    else if (localFilters.maxPrice === '10000') priceLabel = 'Under ₱10,000';
    else if (localFilters.maxPrice === '20000') priceLabel = 'Under ₱20,000';
    else if (localFilters.maxPrice === '50000') priceLabel = 'Under ₱50,000';
    else if (localFilters.minPrice && localFilters.maxPrice) priceLabel = `₱${localFilters.minPrice}-${localFilters.maxPrice}`;
    else if (localFilters.minPrice) priceLabel = `From ₱${localFilters.minPrice}`;
    else if (localFilters.maxPrice) priceLabel = `Up to ₱${localFilters.maxPrice}`;
    
    if (priceLabel) activeFilters.push({ type: 'priceRange', label: priceLabel });
  }
  
  // Duration range filter
  if (localFilters.minDuration || localFilters.maxDuration) {
    let durationLabel = '';
    if (localFilters.minDuration === '1' && localFilters.maxDuration === '3') durationLabel = '1-3 Days';
    else if (localFilters.minDuration === '4' && localFilters.maxDuration === '7') durationLabel = '4-7 Days';
    else if (localFilters.minDuration === '8' && localFilters.maxDuration === '14') durationLabel = '8-14 Days';
    else if (localFilters.minDuration === '15' && localFilters.maxDuration === '30') durationLabel = '15+ Days';
    else if (localFilters.minDuration && localFilters.maxDuration) durationLabel = `${localFilters.minDuration}-${localFilters.maxDuration} Days`;
    else if (localFilters.minDuration) durationLabel = `From ${localFilters.minDuration} days`;
    else if (localFilters.maxDuration) durationLabel = `Up to ${localFilters.maxDuration} days`;
    
    if (durationLabel) activeFilters.push({ type: 'durationRange', label: durationLabel });
  }

  const hasActiveFilters = activeFilters.length > 0;

  // Get current price range value for dropdown
  const getCurrentPriceRange = () => {
    if (localFilters.minPrice === '0' && localFilters.maxPrice === '5000') return '5000';
    if (localFilters.minPrice === '0' && localFilters.maxPrice === '10000') return '10000';
    if (localFilters.minPrice === '0' && localFilters.maxPrice === '20000') return '20000';
    if (localFilters.minPrice === '0' && localFilters.maxPrice === '50000') return '50000';
    return '';
  };

  // Get current duration range value for dropdown
  const getCurrentDurationRange = () => {
    if (localFilters.minDuration === '1' && localFilters.maxDuration === '3') return '3';
    if (localFilters.minDuration === '4' && localFilters.maxDuration === '7') return '7';
    if (localFilters.minDuration === '8' && localFilters.maxDuration === '14') return '14';
    if (localFilters.minDuration === '15' && localFilters.maxDuration === '30') return '30';
    return '';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 ${className}`}>
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              aria-label="Search packages"
              title="Search packages, destinations, or activities"
              placeholder="Search packages, destinations, or activities..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-gray-500 text-sm"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Price Filter */}
          <div className="relative">
            <select
              aria-label="Price range"
              title="Price range"
              value={getCurrentPriceRange()}
              onChange={(e) => handlePriceRangeChange(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-700 appearance-none cursor-pointer min-w-[160px] text-sm"
            >
              <option value="">Any Price</option>
              <option value="5000">Under ₱5,000</option>
              <option value="10000">Under ₱10,000</option>
              <option value="20000">Under ₱20,000</option>
              <option value="50000">Under ₱50,000</option>
            </select>
            {/* Replaced DollarSign with Peso symbol */}
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">₱</span>
          </div>

          {/* Duration Filter */}
          <div className="relative">
            <select
              aria-label="Duration range"
              title="Duration range"
              value={getCurrentDurationRange()}
              onChange={(e) => handleDurationRangeChange(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-700 appearance-none cursor-pointer min-w-[160px] text-sm"
            >
              <option value="">Any Duration</option>
              <option value="3">1-3 Days</option>
              <option value="7">4-7 Days</option>
              <option value="14">8-14 Days</option>
              <option value="30">15+ Days</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              <X size={16} />
              Clear All
            </button>
          )}
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
              {activeFilters.map((filter, index) => (
                <button
                  key={`${filter.type}-${index}`}
                  onClick={() => clearFilter(filter.type)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 group border ${
                          filter.type === 'search' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                            : filter.type === 'priceRange'
                            ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                            : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                        }`}
                >
                  <span>{filter.label}</span>
                  <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageFilters;