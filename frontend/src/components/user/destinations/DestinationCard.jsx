import React, { useState, useMemo } from 'react';
import { MapPin, ExternalLink, Heart, Clock } from 'lucide-react';

const DestinationCard = ({ destination, onClick, viewMode = 'grid' }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Use only real data
  const isNew = useMemo(() => {
    if (!destination.createdAt) return false;
    const createdDate = new Date(destination.createdAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  }, [destination.createdAt]);

  const handleClick = () => {
    onClick(destination);
  };

  const toggleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-gray-200/60 hover:border-amber-200 p-6 flex gap-6"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${destination.name}`}
      >
        {/* Image */}
        <div className="relative w-40 h-32 rounded-xl overflow-hidden flex-shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          )}
          <img
            src={destination.image?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={destination.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Badges - Only show if destination is new */}
          {isNew && (
            <div className="absolute top-2 left-2">
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1 shadow-md">
                <Clock className="w-3 h-3" />
                NEW
              </span>
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={toggleLike}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isLiked 
                ? 'bg-rose-400 text-white scale-110' 
                : 'bg-black/40 text-white hover:bg-rose-400'
            }`}
            aria-label={isLiked ? 'Unlike destination' : 'Like destination'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
              {destination.name}
            </h3>
            {/* Status Badge */}
            {destination.status === 'inactive' && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                Coming Soon
              </span>
            )}
          </div>
          
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" />
            <span className="text-sm font-medium">{destination.location}</span>
          </div>

          <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
            {destination.description || 'Explore this amazing destination and create unforgettable memories.'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {/* Removed date information */}
            </div>
            
            <span className="text-amber-600 font-semibold group-hover:text-amber-700 transition-colors flex items-center gap-1">
              View Details
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-gray-200/60 hover:border-amber-200"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${destination.name}`}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        )}
        
        <img
          src={destination.image?.url || 'https://via.placeholder.com/800x600?text=No+Image'}
          alt={destination.name}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* New Badge - Only show if destination is new */}
          {isNew && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1 shadow-md">
              <Clock className="w-3 h-3" />
              NEW
            </span>
          )}
          
          {/* Status Badge */}
          {destination.status === 'inactive' && (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
              COMING SOON
            </span>
          )}
          
          {/* Like Button */}
          <button
            onClick={toggleLike}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform ${
              isLiked 
                ? 'bg-rose-400 text-white scale-110' 
                : 'bg-black/40 text-white hover:bg-rose-400 scale-100 hover:scale-110'
            }`}
            aria-label={isLiked ? 'Unlike destination' : 'Like destination'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* View Details Hint */}
        <div className={`absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          Click to explore
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
            {destination.name}
          </h3>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium line-clamp-1">{destination.location}</span>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {destination.description || 'Explore this amazing destination and create unforgettable memories.'}
        </p>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
          <span className="text-amber-600 font-semibold group-hover:text-amber-700 transition-colors flex items-center gap-1">
            Explore
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;