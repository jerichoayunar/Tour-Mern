// src/components/admin/destinations/DestinationCard.jsx - UPDATED
import React from 'react';
import MapPreview from '../../Common/MapPreview';

const DestinationCard = ({ destination, onEdit, onDelete, isArchived, onArchive, onRestore, onDeletePermanent }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={destination.image?.url || destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            destination.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {destination.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{destination.name}</h3>
        </div>

        <p className="text-gray-600 text-sm mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {destination.location}
        </p>

        {/* Map Preview */}
        <div className="mb-3 relative h-32 rounded-lg overflow-hidden">
          <MapPreview 
            embedUrl={destination.embedUrl}
            location={destination.location}
            className="h-full w-full"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            Updated: {new Date(destination.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-gray-700 text-sm line-clamp-2 mb-4">
          {destination.description || 'No description provided'}
        </p>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(destination)}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          {isArchived ? (
            <>
              <button
                onClick={() => onRestore && onRestore(destination)}
                className="flex-1 bg-amber-400 text-white py-2 px-3 rounded text-sm font-medium hover:bg-amber-500 transition-colors"
              >
                Restore
              </button>
              <button
                onClick={() => onDeletePermanent && onDeletePermanent(destination)}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete Forever
              </button>
            </>
          ) : (
            <button
              onClick={() => onArchive && onArchive(destination)}
              className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              Archive
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;