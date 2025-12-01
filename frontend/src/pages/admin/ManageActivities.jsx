import React, { useState, useEffect, useCallback } from 'react';
import { activityService } from '../../services/activityService';
import ActivityTable from '../../components/admin/activities/ActivityTable';
import ActivityFilters from '../../components/admin/activities/ActivityFilters';
import ActivityStats from '../../components/admin/activities/ActivityStats';
import Loader from '../../components/ui/Loader';

const ManageActivities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [_serverStats, setServerStats] = useState(null);
  const [activeType, setActiveType] = useState('');
  const [serverResultCount, setServerResultCount] = useState(null);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await activityService.getAllActivities();

      // Our activityService now normalizes to { success, data: [activities], pagination }
      if (response && response.success) {
        const resp = response?.data ?? response;
        let activitiesData = Array.isArray(resp)
          ? resp
          : (resp && resp.success !== undefined)
            ? (Array.isArray(resp.data) ? resp.data : [])
            : (Array.isArray(resp?.data) ? resp.data : []);

        // Debug: log counts for important types to assist troubleshooting
        try {
          const counts = activitiesData.reduce((acc, a) => {
            const type = a.type || a?.data?.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          console.log('🔢 Activity type counts:', {
            user_registered: counts['user_registered'] || 0,
            login_failed: counts['login_failed'] || 0,
            password_changed: counts['password_changed'] || 0,
            login: counts['login'] || 0
          });
          // Log distinct types and sample entries to help mapping
          const distinctTypes = Object.keys(counts).sort().reduce((o, k) => (o[k] = counts[k], o), {});
          console.log('🧭 Distinct activity types present:', distinctTypes);
          console.log('📄 Sample activities (first 5):', activitiesData.slice(0,5));
        } catch (e) {
          console.warn('Failed to compute activity type counts', e);
        }

        // Remove payment-related activities from the admin Activity Monitor per request
        const cleanedActivities = activitiesData.filter(a => {
          const t = String(a.type || '').toLowerCase();
          return !t.includes('payment');
        });

        setActivities(cleanedActivities);
        setFilteredActivities(cleanedActivities);
        // Also fetch server-side aggregated stats for comparison/accuracy
        try {
          const statsResp = await activityService.getActivityStats();
          if (statsResp && statsResp.success) {
            setServerStats(statsResp.data || statsResp);
            console.log('📊 Server activity stats:', statsResp.data || statsResp);
          }
        } catch (e) {
          console.warn('Failed to fetch server stats', e);
        }
        setLastUpdated(new Date());
      } else {
        setActivities([]);
        setFilteredActivities([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load activities. Please try again.');
      setActivities([]);
      setFilteredActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback((filteredActivities) => {
    setFilteredActivities(filteredActivities);
  }, []);

  // Handle server-side type selection (when admin chooses an activity type)
  const handleTypeSelect = useCallback(async (type) => {
    try {
      setLoading(true);
      setError(null);

      if (!type) {
        // empty type -> reload default activities
        setActiveType('');
        setServerResultCount(null);
        await fetchActivities();
        return;
      }

      setActiveType(type);

      // Request server for activities of that type
      const resp = await activityService.getActivitiesByType(type, { limit: 200 });

      const activitiesArray = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
      setActivities(activitiesArray);
      setFilteredActivities(activitiesArray);
      setServerResultCount(Array.isArray(activitiesArray) ? activitiesArray.length : 0);
      setLastUpdated(new Date());
    } catch (e) {
      console.warn('Failed to fetch activities by type', e);
      setError('Failed to load activities for selected type');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();

    // Poll for updates every 30 seconds to keep the monitor fresh
    const interval = setInterval(() => {
      fetchActivities();
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastUpdated) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return lastUpdated.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Monitor</h1>
            <p className="text-lg text-gray-600">Track all user activities and system events</p>
          </div>
          
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Activities</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={fetchActivities}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-platinum p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Activity Monitor</h1>
              <p className="text-base sm:text-lg text-gray-600">
                Track and monitor all user activities and system events in real-time
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {lastUpdated && (
                <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                        <span>Updated {formatLastUpdated()}</span>
                  </span>
                </div>
              )}
                  {activeType && (
                    <div className="text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200 ml-2">
                      <span className="font-medium">Showing</span>
                      <span className="ml-2">{serverResultCount ?? 0}</span>
                      <span className="ml-2 text-gray-500">results for</span>
                      <span className="ml-2 font-medium">{activeType}</span>
                    </div>
                  )}
              
              <button
                onClick={fetchActivities}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center space-x-2 min-w-[120px] justify-center"
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6">
          <ActivityStats activities={activities} />
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <ActivityFilters 
            activities={activities} 
            onFilterChange={handleFilterChange}
            onTypeSelect={handleTypeSelect}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600 bg-white px-4 py-3 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-900">
              {filteredActivities.length} of {activities.length} 
            </span>
            {' '}activities displayed
            {filteredActivities.length !== activities.length && (
              <span className="text-blue-600 ml-2">
                (filtered from {activities.length} total)
              </span>
            )}
          </div>
        </div>

        {/* Activities Table */}
        <ActivityTable 
          activities={filteredActivities} 
          loading={loading} 
        />

        {/* Empty State */}
        {!loading && activities.length === 0 && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activities Recorded</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Activity data will appear here automatically when users perform actions.
            </p>
          </div>
        )}
    </div>
  );
};

export default ManageActivities;