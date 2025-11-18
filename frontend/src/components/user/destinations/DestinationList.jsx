import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Frown, Grid3X3, List } from 'lucide-react';
import DestinationCard from './DestinationCard';
import DestinationModal from './DestinationModal';
import Loader from '../../ui/Loader';

const DestinationList = ({ 
  destinations, 
  loading, 
  error,
  filters,
  onFiltersChange,
  availableLocations,
  onCardClick // Optional prop for external modal control
}) => {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(12);

  // Filter and sort destinations
  const filteredDestinations = useMemo(() => {
    let filtered = destinations.filter(destination => {
      const matchesSearch = !filters.search || 
        destination.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        destination.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        (destination.description && destination.description.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesLocation = !filters.location || 
        (Array.isArray(filters.location) 
          ? filters.location.includes(destination.location)
          : destination.location === filters.location);

      const matchesStatus = !filters.status || 
        destination.status === filters.status;

      return matchesSearch && matchesLocation && matchesStatus;
    });

    // Sort destinations
    switch (filters.sortBy) {
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'location':
        filtered.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default: // 'name'
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [destinations, filters]);

  // Lazy loading implementation
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 100) {
        if (visibleCount < filteredDestinations.length) {
          setVisibleCount(prev => Math.min(prev + 8, filteredDestinations.length));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, filteredDestinations.length]);

  const visibleDestinations = filteredDestinations.slice(0, visibleCount);

  const handleCardClick = (destination) => {
    if (onCardClick) {
      // Use external modal control if provided
      onCardClick(destination);
    } else {
      // Use internal modal control
      setSelectedDestination(destination);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDestination(null);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, filteredDestinations.length));
  };

  const clearAllFilters = () => {
    onFiltersChange({ 
      search: '', 
      location: '', 
      status: 'active', 
      sortBy: 'name' 
    });
  };

  const hasActiveFilters = filters.search || filters.location || 
                          filters.status !== 'active' || filters.sortBy !== 'name';

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-gray-200">
          <Frown className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Destinations</h3>
          <p className="text-gray-600 mb-6">There was a problem fetching the destination data.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader size="lg" />
      </div>
    );
  }

  if (filteredDestinations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-gray-200">
          <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {destinations.length === 0 
              ? 'No Destinations Available' 
              : 'No Matching Destinations'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {destinations.length === 0 
              ? 'Check back soon for amazing destinations!' 
              : 'Try adjusting your filters to see more results.'
            }
          </p>
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Results Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {filteredDestinations.length} Amazing Destinations
            </h2>
            <p className="text-gray-600">
              {filteredDestinations.length === destinations.length 
                ? 'Showing all available destinations' 
                : `Filtered from ${destinations.length} total destinations`
              }
              {visibleCount < filteredDestinations.length && ` • Showing ${visibleCount} of ${filteredDestinations.length}`}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Grid/List */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
      }`}>
        {visibleDestinations.map((destination, index) => (
          <div
            key={destination._id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <DestinationCard
              destination={destination}
              onClick={handleCardClick}
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredDestinations.length && (
        <div className="text-center mt-12">
          <button
            onClick={loadMore}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl transition-all duration-300 font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
          >
            Load More ({filteredDestinations.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Only show modal if we're not using external modal control */}
      {!onCardClick && (
        <DestinationModal
          destination={selectedDestination}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default DestinationList;