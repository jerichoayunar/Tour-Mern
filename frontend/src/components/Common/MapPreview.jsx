// src/components/Common/MapPreview.jsx
import React, { useState } from 'react';

const MapPreview = ({ embedUrl, location, className = "" }) => {
  const [showFullMap, setShowFullMap] = useState(false);

  if (!embedUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-4">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-sm">No map available</p>
          <p className="text-xs">Location: {location}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Small Preview */}
      <div 
        className={`bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${className}`}
        onClick={() => setShowFullMap(true)}
      >
        <div 
          className="w-full h-full transform scale-75 origin-top-left"
          style={{ pointerEvents: 'none' }}
          dangerouslySetInnerHTML={{ __html: embedUrl }}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          Click to expand
        </div>
      </div>

      {/* Full Map Modal */}
      {showFullMap && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Location Map</h3>
              <button
                onClick={() => setShowFullMap(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div 
                className="w-full h-96 rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: embedUrl }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapPreview;