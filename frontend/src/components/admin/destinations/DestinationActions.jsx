import React, { useState } from 'react';

const DestinationActions = ({ 
  selectedDestinations, 
  onBulkStatusChange, 
  onBulkDelete 
}) => {
  const [showActions, setShowActions] = useState(false);

  if (selectedDestinations.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-blue-800 font-medium">
            {selectedDestinations.length} destination(s) selected
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bulk Status Update */}
          <select
            onChange={(e) => {
              onBulkStatusChange(selectedDestinations, e.target.value);
              setShowActions(false);
            }}
            className="px-3 py-1.5 border border-blue-300 rounded text-sm text-blue-700 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Set Status...</option>
            <option value="active">Activate</option>
            <option value="inactive">Deactivate</option>
          </select>

          {/* Bulk Delete */}
          <button
            onClick={() => {
              if (window.confirm(`Delete ${selectedDestinations.length} destination(s)?`)) {
                onBulkDelete(selectedDestinations);
              }
            }}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 focus:ring-2 focus:ring-red-500"
          >
            Delete Selected
          </button>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="px-3 py-1.5 border border-blue-300 rounded text-sm text-blue-700 bg-white hover:bg-blue-50"
            >
              More ▾
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Export Selected
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Duplicate Selected
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationActions;