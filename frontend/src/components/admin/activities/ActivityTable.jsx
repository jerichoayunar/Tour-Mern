import React from 'react';
import { activityService } from '../../../services/activityService';

const ActivityTable = ({ activities = [], loading = false }) => {
  // Color mapping for activity types
  const getColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border border-blue-200',
      green: 'bg-green-50 text-green-600 border border-green-200',
      red: 'bg-red-50 text-red-600 border border-red-200',
      orange: 'bg-orange-50 text-orange-600 border border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
      indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
      gray: 'bg-gray-50 text-gray-600 border border-gray-200'
    };
    return colorMap[color] || 'bg-gray-50 text-gray-600 border border-gray-200';
  };

  // Severity badge colors
  const getSeverityBadge = (severity) => {
    const severityMap = {
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200'
    };
    return `${severityMap[severity] || 'bg-gray-100 text-gray-800 border border-gray-200'} px-2.5 py-1 rounded-full text-xs font-medium`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Activities</h3>
            <p className="text-gray-500 text-sm">Fetching latest activity data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Activity Log</h3>
            <p className="text-sm text-slate-500 mt-1">
              {activities.length} activity{activities.length !== 1 ? 'ies' : ''} found
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
              Real-time
            </span>
          </div>
        </div>
      </div>
      
      {/* Empty State */}
      {activities.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Activities Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {`No activities match your current filters. Try adjusting your search criteria or clear filters to see all activities.`}
          </p>
        </div>
      ) : (
        /* Activities List */
        <div className="relative max-h-[560px] overflow-y-auto px-4 py-6">
          {/* vertical timeline line */}
          <div className="absolute left-10 top-20 bottom-6 w-px bg-slate-100" aria-hidden="true"></div>

          <div className="space-y-4">
            {activities.map((activity) => {
              const config = activityService.getActivityTypeConfig(activity.type);
              const transformed = activityService.transformActivityData 
                ? activityService.transformActivityData(activity)
                : activity;

              return (
                <div key={activity._id || activity.id} className="relative pl-14">
                  {/* marker */}
                  <div className={`absolute left-6 top-1 bg-white rounded-full p-0.5 shadow-sm` }>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${getColorClass(config.color)} text-sm`}>{config.icon}</div>
                  </div>

                  {/* card */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-semibold text-slate-900">{config.label}</h4>
                        <span className={getSeverityBadge(config.severity)}>{config.severity.charAt(0).toUpperCase() + config.severity.slice(1)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600 font-medium">{formatTimestamp(activity.timestamp || activity.createdAt)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(activity.timestamp || activity.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 mt-2 mb-3">{activity.description || transformed.description}</p>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${transformed.userName && transformed.userName !== 'System' ? 'bg-slate-100 text-slate-600' : 'bg-transparent text-slate-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${transformed.userName && transformed.userName !== 'System' ? 'bg-green-400' : 'bg-slate-300'}`}></span>
                        <span>User: <strong className="font-medium">{transformed.userName || 'System'}</strong></span>
                      </div>

                      {activity.ipAddress && (
                        <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                          <span className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span>IP: <strong className="font-medium">{activity.ipAddress}</strong></span>
                        </div>
                      )}

                      {transformed.deviceInfo && transformed.deviceInfo !== 'Unknown' && (
                        <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                          <span className="w-2 h-2 bg-purple-400 rounded-full" />
                          <span>Device: <strong className="font-medium">{transformed.deviceInfo}</strong></span>
                        </div>
                      )}
                    </div>

                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <details className="cursor-pointer">
                          <summary className="text-slate-600 hover:text-slate-800 font-medium flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>View Additional Details</span>
                          </summary>
                          <div className="mt-3 space-y-2">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-start">
                                <span className="font-medium text-slate-600 capitalize flex-shrink-0 mr-4">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span className="text-slate-800 text-right break-all">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTable;