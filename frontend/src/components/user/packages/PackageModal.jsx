import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Car,
  Utensils,
  Home,
  Heart,
  X,
  Calendar
} from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import LazyImage from '../../ui/LazyImage';
import { formatPrice } from '../../../utils/formatters';
import { countInclusionDays, getInclusionsArray, uniqueInclusionsFromPackage, tagToEmoji } from '../../../utils/inclusions';

const PackageModal = ({ package: pkg, isOpen, onClose, onBook, onToggleSelect }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Get image URL
  const getImageUrl = () => {
    if (!pkg) return '';
    if (typeof pkg.image === 'object' && pkg.image.url) {
      return pkg.image.url;
    }
    return pkg.image || 'https://via.placeholder.com/800x600?text=Premium+Tour';
  };

  // Calculate day-specific inclusion summary (prefer array inclusions)
  const getInclusionSummary = () => {
    if (!pkg?.itinerary || !Array.isArray(pkg.itinerary)) {
      return { transport: 0, meals: 0, stay: 0 };
    }
    return {
      transport: countInclusionDays(pkg, 'transport'),
      meals: countInclusionDays(pkg, 'meal'),
      stay: countInclusionDays(pkg, 'stay'),
    };
  };

  // Early return if no package
  if (!pkg) return null;

  const images = [getImageUrl()];
  const inclusionSummary = getInclusionSummary();
  const uniqueTags = uniqueInclusionsFromPackage(pkg);

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const toggleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleBookNow = () => {
    onClose();
    if (typeof onBook === 'function') {
      onBook(pkg);
    } else {
      console.log('Booking package:', pkg._id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      hideHeader={true}
    >
      <div className="space-y-6">
        {/* Image Gallery - Simplified */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <div className="aspect-w-16 aspect-h-9 h-80">
            <LazyImage
              src={images[currentImageIndex]}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={toggleLike}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                isLiked 
                  ? 'bg-rose-400 text-white' 
                  : 'bg-black/40 text-white hover:bg-rose-400'
              }`}
              aria-label={isLiked ? 'Unlike package' : 'Like package'}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-black/40 text-white rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Duration Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
              <Clock className="w-4 h-4" />
              {pkg.duration} Day{pkg.duration !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Header Info - Simplified */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{pkg.title}</h2>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatPrice(pkg.price)}
            </div>
            <div className="text-gray-500">per person</div>
          </div>
        </div>

        {/* Quick Info - Simplified */}
        <div className="flex flex-wrap gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-blue-500" />
            <span className="font-medium">{pkg.duration} Days</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            <span className="font-medium">Small Groups</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            <span className="font-medium">{pkg.itinerary?.length || 0} Itinerary Days</span>
          </div>
        </div>

        {/* Inclusion Summary - show only when there are actual inclusions */}
        {uniqueTags.length > 0 ? (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueTags.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border text-sm text-gray-700">
                  {tagToEmoji(t) ? <span className="text-sm">{tagToEmoji(t)}</span> : null}
                  <span className="truncate max-w-[18rem]">{t}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (inclusionSummary.transport || inclusionSummary.meals || inclusionSummary.stay) && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                <Car size={24} className="mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold text-gray-900">{inclusionSummary.transport}</div>
                <div className="text-sm text-gray-600">Transport Days</div>
              </div>
              <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                <Utensils size={24} className="mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold text-gray-900">{inclusionSummary.meals}</div>
                <div className="text-sm text-gray-600">Meal Days</div>
              </div>
              <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                <Home size={24} className="mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-bold text-gray-900">{inclusionSummary.stay}</div>
                <div className="text-sm text-gray-600">Stay Nights</div>
              </div>
            </div>
          </div>
        )}

        {/* Description - Simplified */}
        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Package Overview</h3>
          <p className="text-gray-700 leading-relaxed">
            {pkg.itinerary && pkg.itinerary.length > 0 
              ? pkg.itinerary[0].description
              : 'Experience an unforgettable journey with this carefully curated tour package. Perfect for travelers seeking adventure, relaxation, and cultural immersion.'
            }
          </p>
        </div>

        {/* Itinerary Preview - Simplified */}
        {pkg.itinerary && pkg.itinerary.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Itinerary</h3>
            <div className="space-y-4">
              {pkg.itinerary.slice(0, 3).map((day, index) => (
                <article
                  key={`itinerary-day-${index}-${day.day || index}`}
                  className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
                  aria-labelledby={`itinerary-day-${index}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="bg-blue-500 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-sm shadow-sm">
                        <span className="text-lg">{day.day}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <header className="flex items-center justify-between mb-2">
                        <h4 id={`itinerary-day-${index}`} className="font-semibold text-gray-900 text-lg truncate">{day.title || `Day ${day.day}`}</h4>
                        <div className="flex gap-2 items-center">
                          {/* Day-specific inclusion badges (if present) */}
                          {getInclusionsArray(day).some(t => String(t).toLowerCase().includes('transport')) && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                              🚗 Transport
                            </span>
                          )}
                          {getInclusionsArray(day).some(t => String(t).toLowerCase().includes('meal')) && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                              🍽️ Meals
                            </span>
                          )}
                          {getInclusionsArray(day).some(t => String(t).toLowerCase().includes('stay')) && (
                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                              🏨 Stay
                            </span>
                          )}
                        </div>
                      </header>

                      <div className="text-gray-700 leading-relaxed mb-3 text-sm">
                        {day.description ? day.description : <span className="text-gray-400">No details provided for this day.</span>}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-2">
                          <MapPin size={16} className="text-primary-500" />
                          <span>Places to Visit</span>
                        </div>

                        {day.places && day.places.length > 0 ? (
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {day.places.map((place, placeIndex) => (
                              <li key={`place-${index}-${placeIndex}`} className="inline-flex items-center gap-2 bg-white text-gray-700 text-sm px-3 py-1 rounded-full border border-gray-200">
                                {place}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-gray-400">No places listed for this day.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {pkg.itinerary.length > 3 && (
                <p className="text-center text-gray-500 text-sm mt-4">+{pkg.itinerary.length - 3} more days in your journey</p>
              )}
            </div>
          </div>
        )}

        {/* CTA Buttons - Simplified */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Close Details
          </Button>
          {typeof onToggleSelect === 'function' && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onToggleSelect(pkg)}
            >
              Add To Selection
            </Button>
          )}
          <Button
            variant="primary"
            className="flex-1 shadow-md hover:shadow-lg"
            onClick={handleBookNow}
          >
            Book This Package
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PackageModal;