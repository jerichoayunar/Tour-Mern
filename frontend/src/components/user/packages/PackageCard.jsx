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

  // Calculate day-specific inclusion summary
  const getInclusionSummary = () => {
    if (!pkg.itinerary || !Array.isArray(pkg.itinerary)) {
      return { transport: 0, meals: 0, stay: 0 };
    }
    
    const transportDays = pkg.itinerary.filter(day => day.inclusions?.transport).length;
    const mealsDays = pkg.itinerary.filter(day => day.inclusions?.meals).length;
    const stayNights = pkg.itinerary.filter(day => day.inclusions?.stay).length;
    
    return { transport: transportDays, meals: mealsDays, stay: stayNights };
  };

  const inclusionSummary = getInclusionSummary();

  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200/60 hover:border-primary-200"
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
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 backdrop-blur-sm shadow-md">
            <Clock size={14} />
            {pkg.duration} Day{pkg.duration !== 1 ? 's' : ''}
          </div>

          {/* Itinerary Badge */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 backdrop-blur-sm shadow-md">
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
      <div className="p-5">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1 mr-3">
            {pkg.title}
          </h3>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-primary-600">
              {formatPrice(pkg.price)}
            </div>
            <div className="text-gray-500 text-xs">per person</div>
          </div>
        </div>
        
        {/* Simple Inclusion Summary */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-center">
            <Car size={16} className="mx-auto mb-1 text-primary-600" />
            <div className="text-xs font-semibold text-gray-900">{inclusionSummary.transport}</div>
            <div className="text-xs text-gray-500">Transport</div>
          </div>
          <div className="text-center">
            <Utensils size={16} className="mx-auto mb-1 text-emerald-600" />
            <div className="text-xs font-semibold text-gray-900">{inclusionSummary.meals}</div>
            <div className="text-xs text-gray-500">Meals</div>
          </div>
          <div className="text-center">
            <Home size={16} className="mx-auto mb-1 text-cyan-600" />
            <div className="text-xs font-semibold text-gray-900">{inclusionSummary.stay}</div>
            <div className="text-xs text-gray-500">Stay</div>
          </div>
        </div>

        {/* Simple CTA - FIXED CURSOR ISSUE */}
        <Button 
          variant="primary"
          className="w-full rounded-xl shadow-md hover:shadow-lg gap-2"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when button is clicked
            onViewDetails(pkg._id);
          }}
        >
          View Details
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PackageCard;