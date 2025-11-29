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

  // Derive a short list of highlight places/titles from the itinerary
  const getHighlights = () => {
    const highlights = [];
    if (!pkg?.itinerary || !Array.isArray(pkg.itinerary)) return highlights;
    for (let day of pkg.itinerary) {
      if (day.places && Array.isArray(day.places)) {
        for (let p of day.places) {
          if (!highlights.includes(p)) highlights.push(p);
          if (highlights.length >= 3) break;
        }
      }
      if (highlights.length >= 3) break;
      if (day.title && !highlights.includes(day.title)) {
        highlights.push(day.title);
      }
      if (highlights.length >= 3) break;
    }
    return highlights;
  };

  const highlights = getHighlights();

  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-gray-200/60 hover:border-blue-200 focus-within:shadow-xl"
      onClick={() => onViewDetails(pkg._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${pkg.title}`}
      aria-expanded={isHovered}
    >
      {/* Image Section - Simplified */}
      <div className="relative h-56 overflow-hidden">
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
        

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 backdrop-blur-sm shadow-sm">
              <Clock size={14} />
              {pkg.duration} Day{pkg.duration !== 1 ? 's' : ''}
            </div>
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 backdrop-blur-sm shadow-sm">
                {pkg.itinerary.length} Itinerary
              </div>
            )}
          </div>
          {/* Like / Save button space (optional) */}
          <div />
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
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 mr-3">
            {pkg.title}
          </h3>
          <div className="text-right flex-shrink-0 ml-3">
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(pkg.price)}
            </div>
            <div className="text-gray-500 text-xs">per person</div>
          </div>
        </div>
        {/* Location (derived from pkg.location or first place in itinerary) */}
        {((pkg.location) || (pkg.itinerary && pkg.itinerary[0] && pkg.itinerary[0].places && pkg.itinerary[0].places[0])) && (
          <div className="flex items-center text-sm text-gray-600 mb-3 gap-2">
            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">
              {pkg.location || (pkg.itinerary && pkg.itinerary[0] && pkg.itinerary[0].places && pkg.itinerary[0].places[0])}
            </span>
          </div>
        )}
        
        {/* Short description preview (truncated) */}
        {pkg.description && (
          <div className="mb-4 relative">
            <p className={`text-sm text-gray-600 leading-relaxed transition-all duration-300 ${isHovered ? 'line-clamp-none max-h-40' : 'line-clamp-3 max-h-20'}`}>
              {pkg.description}
            </p>
            {!isHovered && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
        )}

        {/* Short inclusion summary (transport/meals/stay) */}
        <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
          {inclusionSummary.transport > 0 && (
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
              <Car className="w-4 h-4 text-blue-500" />
              <span>{inclusionSummary.transport} transport</span>
            </div>
          )}

          {inclusionSummary.meals > 0 && (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
              <Utensils className="w-4 h-4 text-green-600" />
              <span>{inclusionSummary.meals} meals</span>
            </div>
          )}

          {inclusionSummary.stay > 0 && (
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
              <Home className="w-4 h-4 text-purple-600" />
              <span>{inclusionSummary.stay} stay</span>
            </div>
          )}
        </div>

        {/* Inclusion Tags (show up to 3) */}
        {uniqueTags && uniqueTags.length > 0 && (
          <div className="mb-4 px-2 flex flex-wrap gap-2">
            {uniqueTags.slice(0,3).map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                {tagToEmoji(t) ? <span className="mr-1">{tagToEmoji(t)}</span> : null}
                <span className="truncate max-w-[12rem]">{t}</span>
              </span>
            ))}
            {uniqueTags.length > 3 && (
              <span className="inline-flex items-center text-xs text-gray-500">+{uniqueTags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Highlights - top places or day titles */}
        {highlights && highlights.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Highlights</div>
            <div className="flex flex-wrap gap-2">
              {highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="truncate max-w-[12rem]">{h}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Simple CTA - FIXED CURSOR ISSUE */}
        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 mt-3">
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(pkg._id); }}
              className="text-blue-600 font-semibold group-hover:text-blue-700 flex items-center gap-2"
            >
              View Details
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <span className="hidden sm:inline">{pkg.capacity ? `${pkg.capacity} pax` : ''}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 text-sm">
                {inclusionSummary.transport > 0 && (
                  <div className="flex items-center gap-1">
                    <Car className="w-4 h-4 text-blue-500" />
                    <span>{inclusionSummary.transport}</span>
                  </div>
                )}

                {inclusionSummary.meals > 0 && (
                  <div className="flex items-center gap-1">
                    <Utensils className="w-4 h-4 text-green-600" />
                    <span>{inclusionSummary.meals}</span>
                  </div>
                )}

                {inclusionSummary.stay > 0 && (
                  <div className="flex items-center gap-1">
                    <Home className="w-4 h-4 text-purple-600" />
                    <span>{inclusionSummary.stay}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;