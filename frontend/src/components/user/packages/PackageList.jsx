import React from 'react';
import { Frown, Grid3X3, List, Sparkles } from 'lucide-react';
import Loader from '../../ui/Loader';
import PackageCard from './PackageCard';

const PackageList = ({ 
  packages = [], 
  loading = false, 
  error = null, 
  onViewDetails,
  viewMode = 'grid',
  onViewModeChange,
  sortBy = 'featured',
  onSortChange
}) => {
  // Simplified Empty State
  if (!loading && packages.length === 0 && !error) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200/60">
        <div className="text-gray-300 mb-6">
          <Frown size={60} className="mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          No Packages Found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          We couldn't find any tour packages matching your search. 
          Try adjusting your filters or explore our featured collections.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Explore All Packages
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-medium transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Simplified Error State
  if (error && !loading) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200/60">
        <div className="text-rose-400 mb-6">
          <Frown size={60} className="mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Something Went Wrong
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {error}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-medium transition-colors duration-200">
            Report Issue
          </button>
        </div>
      </div>
    );
  }

  // Simplified Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Simple Header Skeleton */}
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-200/60">
          <div className="flex items-center gap-4">
            <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex gap-1">
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Simple Package Grid Skeleton */}
        <div className={`${viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'flex flex-col gap-4'}`}
        >
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden"
            >
              {/* Image Skeleton */}
              <div className="h-48 bg-gray-200 animate-pulse relative">
                <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="absolute top-3 right-3 w-20 h-6 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-5 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>

                {/* Simple Inclusion Summary Skeleton */}
                <div className="flex justify-between px-2">
                  {[...Array(3)].map((_, _i) => (
                            <div key={_i} className="text-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-1 animate-pulse"></div>
                      <div className="h-2 bg-gray-200 rounded w-6 mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>

                <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simplified Header */}
      {packages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {packages.length} Package{packages.length !== 1 ? 's' : ''} Available
              </h2>
              <p className="text-gray-600">
                {packages.filter(p => p.featured).length > 0 && 
                  `${packages.filter(p => p.featured).length} featured packages`
                }
              </p>
            </div>
            
            {/* Simplified Controls */}
            <div className="flex items-center gap-4">
              {/* Optional Sort Dropdown */}
              {onSortChange && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              )}

              {/* Simple View Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => onViewModeChange('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-amber-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Grid View"
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => onViewModeChange('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-amber-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Packages Grid */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
        : 'flex flex-col gap-4'
      }>
        {packages.map((pkg, _index) => (
          <div
            key={pkg._id}
            className="transition-all duration-300 hover:shadow-lg"
          >
            <PackageCard 
              package={pkg} 
              onViewDetails={onViewDetails}
            />
          </div>
        ))}
      </div>

      {/* Simple Loading Overlay */}
      {loading && packages.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-gray-200/60">
            <Loader size="lg" />
            <div className="text-left">
              <div className="text-gray-900 font-semibold">Loading More Packages</div>
              <div className="text-gray-600 text-sm">Please wait...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageList;