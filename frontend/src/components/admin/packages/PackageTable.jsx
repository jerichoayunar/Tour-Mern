// src/components/admin/packages/PackageTable.jsx - REMOVED GLOBAL INCLUSIONS
import React from "react";
import Button from "../../ui/Button";

const PackageTable = ({ 
  data, 
  onEdit, 
  _onDelete,
  isArchived = false,
  onArchive,
  onRestore,
  onDeletePermanent
}) => {
  // Helper to get image URL
  const getImageUrl = (packageItem) => {
    if (!packageItem) return 'https://via.placeholder.com/80x60?text=No+Image';
    
    if (typeof packageItem.image === 'object' && packageItem.image?.url) {
      return packageItem.image.url;
    }
    return packageItem.image || 'https://via.placeholder.com/80x60?text=No+Image';
  };

  // Helper to get description
  const getDescription = (packageItem) => {
    if (!packageItem) return 'No description available';
    
    if (packageItem.itinerary && packageItem.itinerary.length > 0) {
      return packageItem.itinerary[0]?.description || 'No description available';
    }
    return packageItem.details || packageItem.description || 'No description available';
  };

  // Helper to calculate package-wide inclusion summary
  const getInclusionSummary = (packageItem) => {
    if (!packageItem?.itinerary || !Array.isArray(packageItem.itinerary)) {
      return { transport: false, meals: false, stay: false };
    }
    
    // Check if ANY day has each inclusion
    const hasTransport = packageItem.itinerary.some(day => day?.inclusions?.transport);
    const hasMeals = packageItem.itinerary.some(day => day?.inclusions?.meals);
    const hasStay = packageItem.itinerary.some(day => day?.inclusions?.stay);
    
    return { transport: hasTransport, meals: hasMeals, stay: hasStay };
  };

  // Empty state handling
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <div className="text-gray-500 text-lg font-medium mb-2">No packages found</div>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Create your first tour package to start accepting bookings.
        </p>
      </div>
    );
  }

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price || 0);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      active: "bg-green-100 text-green-800 border border-green-200",
      inactive: "bg-gray-100 text-gray-800 border border-gray-200"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
        {status === 'active' ? '🟢' : '🔴'} {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // Enhanced inclusion indicator that shows day-specific summary
  const InclusionIndicator = ({ packageItem }) => {
    const inclusionSummary = getInclusionSummary(packageItem);
    
    return (
      <div className="flex flex-col space-y-1 items-center">
        <div className="flex items-center space-x-1" title="Transport included in some days">
          <span className={`inline-block w-2 h-2 rounded-full ${inclusionSummary.transport ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">
            {inclusionSummary.transport ? 'Some' : 'No'} Transport
          </span>
        </div>
        <div className="flex items-center space-x-1" title="Meals included in some days">
          <span className={`inline-block w-2 h-2 rounded-full ${inclusionSummary.meals ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">
            {inclusionSummary.meals ? 'Some' : 'No'} Meals
          </span>
        </div>
        <div className="flex items-center space-x-1" title="Stay included in some days">
          <span className={`inline-block w-2 h-2 rounded-full ${inclusionSummary.stay ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">
            {inclusionSummary.stay ? 'Some' : 'No'} Stay
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{data.length}</span> package{data.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            Prices in Philippine Peso (₱) • Day-specific inclusions
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-left text-xs uppercase font-semibold tracking-wider border-b border-gray-200">
              <th className="px-6 py-4 font-medium">Package</th>
              <th className="px-6 py-4 font-medium text-right">Price</th>
              <th className="px-6 py-4 font-medium text-center">Duration</th>
              <th className="px-6 py-4 font-medium text-center">Itinerary Days</th>
              <th className="px-6 py-4 font-medium text-center">Inclusions</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((pkg, index) => {
              const itinerary = pkg?.itinerary || [];
              const itineraryDays = itinerary.length;
              
              return (
                <tr
                  key={pkg._id || index}
                  className="hover:bg-gray-50 transition-colors duration-150 group"
                >
                  {/* Package Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={getImageUrl(pkg)} 
                        alt={pkg?.title || 'Package Image'}
                        className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x60?text=No+Image';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {pkg?.title || 'Untitled Package'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {getDescription(pkg)}
                            </p>
                            {/* Enhanced: Show itinerary days with inclusion indicators */}
                            {itinerary.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {itinerary.slice(0, 3).map((day, idx) => {
                                  const dayTitle = day?.title || 'Untitled Day';
                                  const dayNumber = day?.day || idx + 1;
                                  const inclusions = day?.inclusions || {};
                                  
                                  return (
                                    <span 
                                      key={idx}
                                      className="inline-flex items-center bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                                      title={`${dayTitle} - Transport: ${inclusions.transport ? 'Yes' : 'No'}, Meals: ${inclusions.meals ? 'Yes' : 'No'}, Stay: ${inclusions.stay ? 'Yes' : 'No'}`}
                                    >
                                      <span>Day {dayNumber}: {dayTitle.length > 12 ? dayTitle.substring(0, 12) + '...' : dayTitle}</span>
                                      {/* Day inclusion indicators */}
                                      <div className="flex ml-1 space-x-1">
                                        {inclusions.transport && (
                                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Transport included"></span>
                                        )}
                                        {inclusions.meals && (
                                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" title="Meals included"></span>
                                        )}
                                        {inclusions.stay && (
                                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" title="Stay included"></span>
                                        )}
                                      </div>
                                    </span>
                                  );
                                })}
                                {itinerary.length > 3 && (
                                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                    +{itinerary.length - 3} more days
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Price */}
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatPrice(pkg?.price)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      per person
                    </div>
                  </td>
                  
                  {/* Duration */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {pkg?.duration || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      day{(pkg?.duration || 0) !== 1 ? 's' : ''}
                    </div>
                  </td>

                  {/* Itinerary Days Count */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {itineraryDays}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      planned
                    </div>
                  </td>
                  
                  {/* Enhanced Inclusions Display */}
                  <td className="px-6 py-4">
                    <InclusionIndicator packageItem={pkg} />
                  </td>
                  
                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={pkg?.status} />
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {isArchived ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onRestore(pkg)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            title="Restore package"
                          >
                            ♻️ Restore
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger" 
                            onClick={() => onDeletePermanent(pkg)}
                            title="Delete permanently"
                          >
                            🗑️ Delete
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onEdit(pkg)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            title="Edit package and day-specific inclusions"
                          >
                            ✏️ Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onArchive(pkg)}
                            className="text-gray-600 border-gray-200 hover:bg-gray-50"
                            title="Archive package"
                          >
                            📦 Archive
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Enhanced Statistics */}
      {data.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Total packages: <span className="font-semibold text-gray-800">{data.length}</span>
              {' • '}
              Itinerary days: <span className="font-semibold text-gray-800">
                {data.reduce((sum, pkg) => sum + ((pkg?.itinerary || []).length || 0), 0)}
              </span>
              {' • '}
              Days with transport: <span className="font-semibold text-gray-800">
                {data.reduce((sum, pkg) => sum + ((pkg?.itinerary || []).filter(day => day?.inclusions?.transport).length || 0), 0)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {data.filter(p => p?.status === 'active').length} active packages
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageTable;