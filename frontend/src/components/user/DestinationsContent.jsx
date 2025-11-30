import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const DestinationsContent = ({ destinations = [], loading, error }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const featuredDestinations = destinations.slice(0, 12);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 320;
    const gap = 32;
    const scrollAmount = cardWidth + gap;
    
    const newScrollLeft = container.scrollLeft + (direction === 'next' ? scrollAmount : -scrollAmount);
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    setTimeout(() => {
      updateArrowVisibility();
      updateActiveIndex();
    }, 300);
  };

  const updateArrowVisibility = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(container.scrollLeft < (container.scrollWidth - container.clientWidth - 10));
  };

  const updateActiveIndex = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollPosition = container.scrollLeft;
    const cardWidth = 320;
    const gap = 32;
    const newIndex = Math.round(scrollPosition / (cardWidth + gap));
    setActiveIndex(newIndex);
  };

  const scrollToIndex = (index) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 320;
    const gap = 32;
    const newScrollLeft = index * (cardWidth + gap);
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateActiveIndex);
      return () => container.removeEventListener('scroll', updateActiveIndex);
    }
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="flex gap-6 overflow-hidden">
              {[...Array(4)].map((_, _i) => (
                <div key={_i} className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg p-6 animate-pulse border">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Unable to load destinations</h3>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!destinations || destinations.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Destinations Available</h3>
            <p className="text-gray-600">Check back later for amazing destinations!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Clean Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the most loved and visited destinations in Bukidnon
          </p>
        </div>

        {/* Navigation */}
        <div className="relative">
          {/* Arrows */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('prev')}
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-3 shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll('next')}
              aria-label="Scroll right"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-3 shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            </button>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={updateArrowVisibility}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
            }}
          >
            {featuredDestinations.map((destination, index) => (
              <div
                key={destination._id}
                className="flex-shrink-0 w-80 snap-start group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-1 border border-gray-100"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={destination.image?.url}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
                  
                  {/* Location Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-white/95 px-3 py-2 rounded-xl shadow-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{destination.location}</span>
                    </div>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white leading-tight">
                      {destination.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                  <div className="p-6">
                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3 text-[15px]">
                    {destination.description || 'Experience the beauty and adventure of this amazing destination.'}
                  </p>
                  
                  {/* Additional Info */}
                  <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Full Day</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="text-emerald-600 font-medium">All Year</div>
                  </div>
                  
                  {/* CTA Button */}
                  <Link
                    to="/destinations"
                    aria-label={`Explore ${destination.name}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Explore Destination
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicators */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {featuredDestinations.slice(0, 6).map((_, _i) => (
            <button
              key={_i}
              onClick={() => scrollToIndex(_i * 2)}
              aria-label={`Go to slide ${_i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                Math.floor(activeIndex / 2) === _i
                  ? 'bg-blue-500 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View all destinations
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DestinationsContent;