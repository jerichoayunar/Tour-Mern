// src/components/user/packages/PackageCard.jsx - FIXED CURSOR ISSUE
import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Car,
  Utensils,
  Home,
  Star,
  ExternalLink
} from 'lucide-react';
import Button from '../../ui/Button';
import LazyImage from '../../ui/LazyImage';
import { formatPrice } from '../../../utils/formatters';
import { countInclusionDays, uniqueInclusionsFromPackage, tagToEmoji } from '../../../utils/inclusions';

const PackageCard = ({ package: pkg, onViewDetails }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get image URL
  const getImageUrl = () => {
    if (typeof pkg.image === 'object' && pkg.image.url) {
      return pkg.image.url;
    }
    return pkg.image || 'https://via.placeholder.com/300x200?text=No+Image';
  };

  // Calculate day-specific inclusion summary (prefer array inclusions)
  const getInclusionSummary = () => {
    if (!pkg.itinerary || !Array.isArray(pkg.itinerary)) {
      return { transport: 0, meals: 0, stay: 0 };
    }
    return {
      transport: countInclusionDays(pkg, 'transport'),
      meals: countInclusionDays(pkg, 'meal'),
      stay: countInclusionDays(pkg, 'stay'),
    };
  };

  const inclusionSummary = getInclusionSummary();
  const uniqueTags = uniqueInclusionsFromPackage(pkg);

  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200/60 hover:border-blue-200"
      onClick={() => onViewDetails(pkg._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${pkg.title}`}
    >
      {/* Image Section - Simplified */}
      <div className="relative h-48 overflow-hidden">
        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        )}
        
        <LazyImage
          src={getImageUrl()}
          alt={pkg.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-105' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Simple Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Duration Badge */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 backdrop-blur-sm shadow-sm">
            <Clock size={14} />
            {pkg.duration} Day{pkg.duration !== 1 ? 's' : ''}
          </div>

          {/* Itinerary Badge */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 backdrop-blur-sm shadow-sm">
              {pkg.itinerary.length} Itinerary
            </div>
          )}
        </div>

        {/* View Details Hint */}
        <div className={`absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          Click to explore
        </div>
      </div>

      {/* Content Section - Clean and Simple */}
      <div className="p-6">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 mr-3">
            {pkg.title}
          </h3>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(pkg.price)}
            </div>
            <div className="text-gray-500 text-xs">per person</div>
          </div>
        </div>
        
        {/* Inclusion Tags (show up to 3) */}
        {uniqueTags && uniqueTags.length > 0 && (
          <div className="mb-4 px-2 flex flex-wrap gap-2">
            {uniqueTags.slice(0,3).map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border text-sm text-gray-700">
                {tagToEmoji(t) ? <span className="mr-1">{tagToEmoji(t)}</span> : null}
                <span className="truncate max-w-[12rem]">{t}</span>
              </span>
            ))}
            {uniqueTags.length > 3 && (
              <span className="inline-flex items-center text-xs text-gray-500">+{uniqueTags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Simple CTA - FIXED CURSOR ISSUE */}
        <Button 
          variant="primary"
          className="w-full rounded-xl shadow-sm hover:shadow-md gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when button is clicked
            onViewDetails(pkg._id);
          }}
        >
          View Details
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default PackageCard;