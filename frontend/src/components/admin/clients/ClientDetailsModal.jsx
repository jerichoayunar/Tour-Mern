// frontend/src/components/admin/clients/ClientDetailsModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { clientService } from '../../../services/clientService';
import { activityService } from '../../../services/activityService';
import bookingService from '../../../services/bookingService';
import Button from '../../ui/Button';

const ClientDetailsModal = ({ client, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Activity state
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilters, setActivityFilters] = useState({
    type: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [activityStats, setActivityStats] = useState({
    total: 0,
    logins: 0,
    security: 0,
    recent: 0
  });

  // Booking history state
  const [bookingHistory, setBookingHistory] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Filter activities based on current filters
  const filterActivities = useCallback((activities) => {
    let filtered = [...activities];
    
    // Filter by type
    if (activityFilters.type) {
      filtered = filtered.filter(activity => activity.type === activityFilters.type);
    }
    
    // Filter by search
    if (activityFilters.search) {
      const searchTerm = activityFilters.search.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(searchTerm) ||
        activity.type.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [activityFilters.type, activityFilters.search]);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        role: client.role || 'user',
        status: client.status || 'active'
      });
    }
  }, [client]);

  // Fetch activities when activity tab is active
  useEffect(() => {
    if (isOpen && client && activeTab === 'activity') {
      fetchUserActivities();
    }
    // Note: fetchUserActivities is a stable function declaration (hoisted)
  }, [activeTab, client, isOpen, fetchUserActivities]);

  // Fetch booking history when bookings tab is active
  useEffect(() => {
    if (isOpen && client && activeTab === 'bookings') {
      fetchClientBookings();
    }
  }, [activeTab, client, isOpen, fetchClientBookings]);

  // Fixed activity fetching
  const fetchUserActivities = useCallback(async () => {
    try {
      setActivityLoading(true);
      console.log('🔄 Fetching activities for user:', client.id);
      // request a larger page to include more historical activities for filtering
      const response = await activityService.getUserActivities(client.id, {
        limit: 200,
        page: activityFilters.page || 1,
        search: activityFilters.search || undefined
      });
      console.log('📦 API Response:', response);

      // Normalize response into an array of activities
      const resp = response?.data ?? response;
      let activitiesData = [];

      if (Array.isArray(resp)) {
        activitiesData = resp;
      } else if (resp && resp.success !== undefined) {
        // canonical shape { success, data }
        activitiesData = resp.data ?? resp.activities ?? resp.items ?? [];
      } else {
        activitiesData = resp?.activities ?? resp?.data ?? resp?.items ?? [];
      }

      if (!Array.isArray(activitiesData)) {
        // Fallback: scan object values for first array
        const candidates = [];
        if (resp && typeof resp === 'object') {
          Object.values(resp).forEach(v => {
            if (Array.isArray(v)) candidates.push(v);
            if (v && typeof v === 'object') Object.values(v).forEach(nv => { if (Array.isArray(nv)) candidates.push(nv); });
          });
        }
        activitiesData = candidates.length > 0 ? candidates[0] : [];
      }
      
      const transformedActivities = activitiesData.map(activity =>
        activityService.transformActivityData(activity)
      );
      
      console.log('🎯 All activities:', transformedActivities);
      
      // Apply client-side filtering
      const filteredActivities = filterActivities(transformedActivities);
      console.log('🔍 Filtered activities:', filteredActivities);
      
      setActivities(filteredActivities);
      
      // Calculate statistics from ALL activities (not filtered)
      calculateActivityStats(transformedActivities);
      
    } catch (error) {
      console.error('❌ Failed to fetch user activities:', error);
      setActivities([]);
      setActivityStats({
        total: 0,
        logins: 0,
        security: 0,
        recent: 0
      });
    } finally {
      setActivityLoading(false);
    }
  }, [client?.id, activityFilters.page, activityFilters.search, filterActivities]);

  // Fetch client bookings (admin view)
  const fetchClientBookings = useCallback(async () => {
    try {
      setBookingLoading(true);
      console.log('🔄 Fetching bookings for user:', client.id);

      const response = await bookingService.getBookings({ userId: client.id });
      console.log('📦 Bookings API Response:', response);

      // Normalize response into an array of bookings
      const resp = response?.data ?? response;
      let bookingsData = [];

      if (Array.isArray(resp)) {
        bookingsData = resp;
      } else if (resp && resp.success !== undefined) {
        bookingsData = resp.data ?? resp.bookings ?? resp.items ?? [];
      } else {
        bookingsData = resp?.bookings ?? resp?.data ?? resp?.items ?? [];
      }

      if (!Array.isArray(bookingsData)) {
        const candidates = [];
        if (resp && typeof resp === 'object') {
          Object.values(resp).forEach(v => {
            if (Array.isArray(v)) candidates.push(v);
            if (v && typeof v === 'object') Object.values(v).forEach(nv => { if (Array.isArray(nv)) candidates.push(nv); });
          });
        }
        bookingsData = candidates.length > 0 ? candidates[0] : [];
      }

      console.log('🔎 Resolved bookings array length:', bookingsData.length);
      setBookingHistory(bookingsData);
    } catch (error) {
      console.error('❌ Failed to fetch client bookings:', error);
      setBookingHistory([]);
    } finally {
      setBookingLoading(false);
    }
  }, [client?.id]);

  // Calculate activity statistics
  const calculateActivityStats = (activities) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stats = {
      total: activities.length,
      logins: activities.filter(a => a.type.includes('login')).length,
      security: activities.filter(a => {
        const config = activityService.getActivityTypeConfig(a.type);
        return config.severity === 'warning' || config.severity === 'error';
      }).length,
      recent: activities.filter(a => new Date(a.timestamp) > twentyFourHoursAgo).length
    };
    
    setActivityStats(stats);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setActivityFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Re-filter existing activities when filter changes
    // For type/search/page changes, fetch latest user activities from server
    if (['type', 'search', 'page'].includes(key)) {
      // update filters state first, then fetch
      setTimeout(() => {
        fetchUserActivities();
      }, 0);
      return;
    }

    if (activities.length > 0) {
      const filtered = filterActivities(activities);
      setActivities(filtered);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(client.id, formData);
      setIsEditing(false);
    } catch {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      role: client.role || 'user',
      status: client.status || 'active'
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      user: 'bg-stone-100 text-stone-800 border-stone-200',
      premium: 'bg-primary-100 text-primary-800 border-primary-200',
      agent: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${roleConfig[role] || 'bg-gray-100 text-gray-800'}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  // Booking status badge
  const getBookingBadge = (status) => {
    const cfg = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
      completed: 'bg-sky-100 text-sky-800 border-sky-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${cfg[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // Format a number as Philippine Peso currency
  const formatPeso = (value) => {
    const n = Number(value) || 0;
    try {
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n);
    } catch {
      return `₱${n.toLocaleString()}`;
    }
  };

  // Get color class safely
  const getColorClass = (color) => {
    const colorMap = {
      blue: 'bg-stone-100 text-stone-600',
      green: 'bg-emerald-100 text-emerald-600',
      red: 'bg-rose-100 text-rose-600',
      cyan: 'bg-cyan-100 text-cyan-600',
      purple: 'bg-primary-100 text-primary-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-stone-100 text-stone-600',
      gray: 'bg-gray-100 text-gray-600'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  };

  // Format metadata for display - FIXED
  const formatMetadata = (metadata) => {
    if (!metadata) return null;
    
    // Handle common metadata formats
    const formatted = {};
    
    Object.entries(metadata).forEach(([key, value]) => {
      // Fix NaN and undefined values
      if (value === undefined || value === null) {
        formatted[key] = 'N/A';
      } else if (typeof value === 'number' && isNaN(value)) {
        formatted[key] = 'N/A';
      } else {
        formatted[key] = value;
      }
    });
    
    return formatted;
  };

  if (!isOpen || !client) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-4xl max-h-[90vh]">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-gray-200">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {client.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    ) : (
                      client.name
                    )}
                  </h2>
                  <p className="text-gray-600">{client.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={loading}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-2xl p-2"
                  >
                    &times;
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 px-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>📋</span>
                <span>Client Details</span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === 'activity'
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>👤</span>
                <span>Activity {activityStats.total > 0 && `(${activityStats.total})`}</span>
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === 'bookings'
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>📦</span>
                <span>Bookings</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: CLIENT DETAILS */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{client.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{client.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{client.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                      {isEditing ? (
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      ) : (
                        getStatusBadge(client.status)
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                      {isEditing ? (
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="user">User</option>
                          <option value="premium">Premium User</option>
                          <option value="agent">Travel Agent</option>
                        </select>
                      ) : (
                        getRoleBadge(client.role)
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Login Method</label>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          client.loginMethod === 'google' 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-stone-100 text-stone-800 border border-stone-200'
                        }`}>
                          {client.loginMethod === 'google' ? 'Google' : 'Email'}
                        </span>
                        {client.emailVerified && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                        <p className="text-sm text-gray-600">{formatDate(client.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-sm text-gray-600">{formatDate(client.updatedAt)}</p>
                      </div>
                    </div>

                    {client.lastLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                        <p className="text-sm text-gray-600">{formatDate(client.lastLogin)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVITY */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {activityStats.total > 0 
                        ? `${activityStats.total} total activities` 
                        : 'No activities recorded'
                      }
                      {activityFilters.type && ` • Filtered by: ${activityFilters.type}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select 
                      value={activityFilters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Activities</option>
                      <option value="login">Login Only</option>
                      <option value="logout">Logout Only</option>
                      <option value="user_registered">Registration</option>
                      <option value="profile_updated">Profile Updates</option>
                      <option value="password_changed">Password Changes</option>
                      <option value="login_failed">Failed Logins</option>
                    </select>
                    
                    <Button 
                      onClick={fetchUserActivities}
                      disabled={activityLoading}
                      variant="primary"
                      className="flex items-center space-x-2"
                    >
                      <span>Refresh</span>
                    </Button>
                  </div>
                </div>

                {/* Activity Statistics */}
                {activityStats.total > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="font-bold text-gray-900 text-xl">{activityStats.total}</div>
                      <div className="text-gray-600">Total Activities</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="font-bold text-gray-900 text-xl">{activityStats.logins}</div>
                      <div className="text-gray-600">Login Events</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="font-bold text-gray-900 text-xl">{activityStats.security}</div>
                      <div className="text-gray-600">Security Events</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="font-bold text-gray-900 text-xl">{activityStats.recent}</div>
                      <div className="text-gray-600">Last 24h</div>
                    </div>
                  </div>
                )}
                
                {activityLoading ? (
                  // Loading skeleton
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {activities.map((activity) => {
                      const config = activityService.getActivityTypeConfig(activity.type);
                      const formattedMetadata = formatMetadata(activity.metadata);
                      
                      return (
                        <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${getColorClass(config.color)}`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {config.label}
                              </p>
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {activity.formattedTime}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 break-words">
                              {activity.description}
                            </p>
                            
                            {/* Metadata Display */}
                            {formattedMetadata && Object.keys(formattedMetadata).length > 0 && (
                              <div className="mt-3 p-3 bg-white rounded border border-gray-300 text-sm">
                                <details>
                                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                                    View Details
                                  </summary>
                                  <div className="mt-2 space-y-2">
                                    {Object.entries(formattedMetadata).map(([key, value]) => {
                                      let displayValue = String(value);
                                      
                                      if (key === 'remainingAttempts' && (isNaN(value) || value === null || value === undefined)) {
                                        displayValue = 'N/A';
                                      }
                                      
                                      if (key === 'attemptedEmail' && value) {
                                        displayValue = String(value).replace('attemptedEmatl', '');
                                      }
                                      
                                      if (key === 'reason' && value) {
                                        displayValue = String(value)
                                          .replace('NaN', 'N/A')
                                          .replace('attemptedEmatl', 'email:');
                                      }
                                      
                                      return (
                                        <div key={key} className="flex flex-col sm:flex-row sm:items-start">
                                          <span className="font-medium text-gray-700 sm:w-24 flex-shrink-0 mb-1 sm:mb-0 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                          </span>
                                          <span className="text-gray-800 break-words">{displayValue}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </details>
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2 text-sm text-gray-500">
                              <span>IP: {activity.ipAddress || 'N/A'}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>Device: {activity.deviceInfo}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{activity.formattedDate}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⏰</span>
                    </div>
                    <p className="text-gray-600">
                      {activityFilters.type ? 'No activities match your filter' : 'No activity recorded'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {activityFilters.type ? 'Try changing your filter settings' : 'This user hasn\'t performed any actions yet'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Booking History</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {client?.bookingCount > 0 ? `${client.bookingCount} total bookings` : 'Booking history'}
                      {client?.totalSpent != null && ` • ${formatPeso(client.totalSpent)} total spent`}
                    </p>
                  </div>
                  <div>
                    <Button onClick={fetchClientBookings} disabled={bookingLoading} variant="secondary">Refresh</Button>
                  </div>
                </div>

                {bookingLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : bookingHistory.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {bookingHistory.map((booking) => (
                      <div key={booking.id || booking._id || booking.bookingId || Math.random()} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{booking.package?.title || booking.destination?.name || booking.reference || `Booking #${booking.id || booking._id || booking.bookingId}`}</div>
                                <div className="text-sm text-gray-500">{booking.customerName || booking.clientName || client.name}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''}</div>
                                <div className="mt-2">{getBookingBadge(booking.status || booking.state)}</div>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">Total: {formatPeso(booking.totalPrice ?? booking.totalAmount ?? booking.total ?? booking.amount)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-gray-600">No bookings yet</p>
                    <p className="text-sm text-gray-500 mt-2">This client hasn't made any bookings</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientDetailsModal;