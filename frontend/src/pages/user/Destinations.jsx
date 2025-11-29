import React, { useState, useMemo, useEffect } from 'react';
import { useDestinations } from '../../hooks/useDestinations';
import DestinationList from '../../components/user/destinations/DestinationList';
import DestinationFilters from '../../components/user/destinations/DestinationFilters';
import DestinationModal from '../../components/user/destinations/DestinationModal';
import { MapPin, Navigation, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const Destinations = () => {
  const { destinations, loading, error } = useDestinations();
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    status: 'active',
    sortBy: 'name'
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enhanced hero slides with ACTUAL destination data
  const heroSlides = useMemo(() => {
    // Use only destinations that have images
    const destinationSlides = destinations
      .filter(dest => dest.image?.url && dest.image.isUploaded)
      .map(dest => dest);

    // If we have destination slides, use them
    if (destinationSlides.length > 0) {
      return destinationSlides;
    }

    // Fallback with minimal data
    return [
      {
        _id: 'fallback-1',
        name: 'Mountain Paradise',
        location: 'Swiss Alps',
        description: 'Experience breathtaking mountain views and fresh alpine air.',
        image: {
          url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
          isUploaded: true
        },
        status: 'active'
      },
      {
        _id: 'fallback-2',
        name: 'Tropical Beach',
        location: 'Maldives',
        description: 'Relax on pristine white sand beaches with crystal clear waters.',
        image: {
          url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
          isUploaded: true
        },
        status: 'active'
      }
    ];
  }, [destinations]);

  // Auto-rotate hero slides
  useEffect(() => {
    if (heroSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroSlides.length]);

  const nextSlide = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleExploreNow = (destination, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDestination(null);
  };

  const handleCardClick = (destination) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const extractUniqueLocations = useMemo(() => {
    const locations = destinations.map(dest => dest.location).filter(Boolean);
    return [...new Set(locations)].sort();
  }, [destinations]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-emerald-50/20">
      {/* Enhanced Hero Section */}
      <div className="relative h-96 lg:h-[500px] overflow-hidden">
        {/* Background Slides with Destination Overlays */}
        {heroSlides.map((slide, _index) => (
          <div
            key={slide._id || slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              _index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image?.url}
              alt={slide.name}
              className="w-full h-full object-cover"
            />
            
            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            
            {/* Destination Info Overlay */}
            <div className="absolute left-8 lg:left-16 bottom-8 text-white max-w-md z-30">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">{slide.name}</h3>
                <div className="flex items-center text-white/90 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{slide.location}</span>
                </div>
                <button 
                  onClick={(e) => handleExploreNow(slide, e)}
                  className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 relative z-40 cursor-pointer active:scale-95"
                >
                  Explore Now
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 z-40 cursor-pointer active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 z-40 cursor-pointer active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-40">
            {heroSlides.map((_, _index) => (
              <button
                key={_index}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentSlide(_index);
                }}
                className={`transition-all duration-300 cursor-pointer active:scale-95 ${
                  _index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%'
                }}
                aria-label={`Go to slide ${_index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Main Hero Content */}
        <div className="relative z-20 container mx-auto px-4 h-full flex items-center justify-end">
          <div className="text-right max-w-2xl">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
              <Navigation className="w-5 h-5" />
              <span className="font-semibold text-white">Discover Your Next Adventure</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Explore
              <span className="block bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                Bukidnon
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              Uncover hidden gems and create unforgettable memories with our handpicked destinations.
            </p>
          </div>  
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Modern Horizontal Filter Bar */}
        <DestinationFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableLocations={extractUniqueLocations}
        />

        {/* Destination List */}
        <DestinationList
          destinations={destinations}
          loading={loading}
          error={error}
          filters={filters}
          onCardClick={handleCardClick}
        />
      </div>

      {/* Modal for both Hero Section and Destination Cards */}
      <DestinationModal
        destination={selectedDestination}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Destinations;