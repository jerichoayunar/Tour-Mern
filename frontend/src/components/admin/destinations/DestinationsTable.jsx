// src/components/admin/destinations/DestinationsTable.jsx - UPDATED
import React from 'react';

const DestinationsTable = ({ 
  destinations, 
  onEdit, 
  onDelete, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-2xl animate-spin mb-4">⟳</div>
        <p>Loading destinations...</p>
      </div>
    );
  }

  if (!destinations || destinations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🏔️</div>
        <h3 className="text-lg font-semibold mb-2">No destinations found</h3>
        <p>Get started by creating your first destination!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Location
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {destinations.map((destination) => (
            <tr key={destination._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <img 
                  src={destination.image?.url || destination.image} 
                  alt={destination.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                  }}
                />
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{destination.name}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {destination.location}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  destination.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {destination.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onEdit(destination)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(destination)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DestinationsTable;