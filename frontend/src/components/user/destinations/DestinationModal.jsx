import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Heart, Map, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../ui/Modal';

const DestinationModal = ({ destination, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Extract map URL from embedUrl field
  const mapUrl = useMemo(() => {
    if (!destination?.embedUrl) return null;
    
    const embedUrl = destination.embedUrl;
    if (embedUrl.startsWith('http')) return embedUrl;
    
    const srcMatch = embedUrl.match(/src="([^"]*)"/);
    return srcMatch ? srcMatch[1] : null;
  }, [destination?.embedUrl]);

  // Use only real images
  const images = useMemo(() => {
    if (!destination) return ['https://via.placeholder.com/1200x800?text=No+Image+Available'];
    
    const mainImage = destination.image?.url;
    if (mainImage) {
      return [mainImage];
    }
    return ['https://via.placeholder.com/1200x800?text=No+Image+Available'];
  }, [destination]);

  // Check if destination is new (created in last 30 days)
  const isNew = useMemo(() => {
    if (!destination?.createdAt) return false;
    const createdDate = new Date(destination.createdAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  }, [destination?.createdAt]);

  // Early return must be AFTER all hooks
  if (!destination) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="space-y-6">
        {/* Image Section */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <div className="aspect-w-16 aspect-h-9 h-80">
            <img
              src={images[currentImageIndex]}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Navigation Arrows - Only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Indicators - Only show if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, _index) => (
                <button
                  key={_index}
                  onClick={() => setCurrentImageIndex(_index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    _index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                  aria-label={`Go to image ${_index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={toggleLike}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                isLiked 
                  ? 'bg-rose-400 text-white' 
                  : 'bg-black/40 text-white hover:bg-rose-400'
              }`}
              aria-label={isLiked ? 'Unlike destination' : 'Like destination'}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            {/* modal already provides a close control; avoid duplicate X here */}
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isNew && (
              <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                NEW DESTINATION
              </span>
            )}
            {destination.status === 'inactive' && (
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                COMING SOON
              </span>
            )}
          </div>
        </div>

        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{destination.name}</h2>
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              <MapPin className="w-5 h-5 text-primary-500" />
              {destination.location}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
            <Navigation className="w-5 h-5 text-primary-500" />
            About this Destination
          </h3>
          <p className="text-gray-700 leading-relaxed text-justify">
            {destination.description || 'This destination offers unique experiences and breathtaking views. Explore and create unforgettable memories.'}
          </p>
        </div>

        {/* Map Section - Only show if we have map URL */}
        {mapUrl && (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Map className="w-5 h-5 text-primary-500" />
              Location on Map
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
              <iframe
                src={mapUrl}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${destination.name} in ${destination.location}`}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DestinationModal;