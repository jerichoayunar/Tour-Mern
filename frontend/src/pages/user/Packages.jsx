// src/pages/user/Packages.jsx - WITH PROPER FOOTER SPACING
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { usePackages } from '../../hooks/usePackages';
import PackageList from '../../components/user/packages/PackageList';
import PackageModal from '../../components/user/packages/PackageModal';
import PackageFilters from '../../components/user/packages/PackageFilters';

const Packages = () => {
  const { 
    packages, 
    loading, 
    error, 
    fetchPackages,
    clearFilters 
  } = usePackages();

  // Local state
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
  });

  // Scroll animation states
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  // Use ref for debounce timer
  const debounceTimerRef = useRef(null);

  // Memoize the current filter state for comparison
  const currentFilters = useMemo(() => {
    return filters;
  }, [filters]);

  // Track previous filters to prevent unnecessary refetches
  const previousFiltersRef = useRef({});

  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const heroHeight = heroRef.current?.offsetHeight || windowHeight;
      
      // Calculate scroll progress (0 to 1)
      const progress = Math.min(scrollY / (heroHeight * 0.7), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply search and filters with proper debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const hasFiltersChanged = JSON.stringify(currentFilters) !== JSON.stringify(previousFiltersRef.current);
    
    if (hasFiltersChanged) {
      debounceTimerRef.current = setTimeout(() => {
        if (Object.keys(currentFilters).filter(key => currentFilters[key]).length > 0) {
          fetchPackages(currentFilters);
        } else {
          if (Object.keys(previousFiltersRef.current).filter(key => previousFiltersRef.current[key]).length > 0) {
            fetchPackages({});
          }
        }
        
        previousFiltersRef.current = { ...currentFilters };
      }, 800);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentFilters, fetchPackages]);

  // Handle view details - open modal
  const handleViewDetails = (packageId) => {
    const selected = packages.find(pkg => pkg._id === packageId);
    setSelectedPackage(selected);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  // Handle filter changes from PackageFilters component
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Scroll to content function
  const scrollToContent = () => {
    const heroHeight = heroRef.current?.offsetHeight || window.innerHeight;
    window.scrollTo({
      top: heroHeight - 80,
      behavior: 'smooth'
    });
  };

  // Background parallax effect
  const backgroundStyle = {
    transform: `translateY(${scrollProgress * -20}px) scale(${1 + scrollProgress * 0.02})`
  };

  // Hero content animation
  const heroContentStyle = {
    opacity: 1 - scrollProgress * 1.5,
    transform: `translateY(${scrollProgress * 40}px)`
  };

  return (
    <div className="min-h-screen relative bg-slate-900">
      {/* Continuous Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
          ...backgroundStyle
        }}
      >
        {/* Unified gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-800/80 to-slate-900/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/5 via-transparent to-slate-50/10"></div>
      </div>

      {/* Clean Hero Section */}
      <section 
        ref={heroRef}
        className="relative h-[70vh] min-h-[500px] flex items-end pb-16 z-10"
      >
        <div className="container mx-auto px-4">
          <div 
            className="text-center text-white mb-8"
            style={heroContentStyle}
          >
            {/* Minimal Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles size={16} className="text-amber-400" />
              <span className="font-medium text-xs tracking-widest uppercase">Premium Travel Experiences</span>
            </div>

            {/* Clean Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
              <span className="block text-white">Discover</span>
              <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mt-2">
                Your Journey
              </span>
            </h1>

            {/* Simple Subtitle */}
            <p className="text-lg text-white/80 max-w-md mx-auto leading-relaxed">
              Curated travel packages with detailed itineraries and unforgettable experiences.
            </p>
          </div>
        </div>

        {/* Subtle Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/60 hover:text-white transition-colors duration-300"
          style={{ opacity: 1 - scrollProgress * 2 }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs tracking-widest uppercase mb-1">Explore</span>
            <div className="w-5 h-8 border border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white/60 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </button>
      </section>

      {/* Main Content Section */}
      <div 
        ref={contentRef}
        className="relative z-10 min-h-screen bg-transparent"
      >
        <div className="container mx-auto px-4 -mt-20">
          {/* Only PackageFilters - No extra search bar */}
          <div className="mb-12">
            <PackageFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* PackageList with proper bottom spacing for footer */}
          <div className="pb-32"> {/* Increased bottom padding for footer space */}
            <PackageList
              packages={packages}
              loading={loading}
              error={error}
              onViewDetails={handleViewDetails}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Package Detail Modal */}
      <PackageModal
        package={selectedPackage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Packages;