// frontend/src/services/activityService.js - FIXED
import api from './api';

const normalizeResponse = (response) => {
  const payload = response?.data || {};
  return {
    success: payload.success,
    data: payload.data ?? payload,
    message: payload.message,
    token: payload.data?.token ?? payload.token
  };
};

// ✅ MOVED: Helper functions to the top to avoid circular dependency
const getDeviceInfo = (userAgent) => {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
};

const getActivityTypeConfig = (type) => {
  const config = {
    user_registered: { icon: '👤', color: 'blue', label: 'User Registered', severity: 'info' },
    profile_updated: { icon: '✏️', color: 'green', label: 'Profile Updated', severity: 'info' },
    login: { icon: '🔐', color: 'indigo', label: 'Login', severity: 'info' },
    logout: { icon: '🚪', color: 'gray', label: 'Logout', severity: 'info' },
    password_changed: { icon: '🔒', color: 'orange', label: 'Password Changed', severity: 'warning' },
    booking_created: { icon: '📅', color: 'purple', label: 'Booking Created', severity: 'info' },
    booking_modified: { icon: '🔄', color: 'yellow', label: 'Booking Modified', severity: 'info' },
    booking_cancelled: { icon: '❌', color: 'red', label: 'Booking Cancelled', severity: 'warning' },
    payment_success: { icon: '💳', color: 'emerald', label: 'Payment Success', severity: 'success' },
    payment_failed: { icon: '⚠️', color: 'red', label: 'Payment Failed', severity: 'error' },
    inquiry_submitted: { icon: '🎫', color: 'pink', label: 'Inquiry Submitted', severity: 'info' },
    email_verified: { icon: '✅', color: 'green', label: 'Email Verified', severity: 'success' },
    account_suspended: { icon: '⛔', color: 'red', label: 'Account Suspended', severity: 'error' },
    account_activated: { icon: '✅', color: 'green', label: 'Account Activated', severity: 'success' },
    login_failed: { icon: '🔴', color: 'red', label: 'Login Failed', severity: 'warning' },
    password_reset_requested: { icon: '📧', color: 'blue', label: 'Password Reset Requested', severity: 'warning' },
    booking_status_updated: { icon: '🔄', color: 'yellow', label: 'Booking Status Updated', severity: 'info' }
  };
  return config[type] || { icon: '📝', color: 'gray', label: 'Activity', severity: 'info' };
};

const getActivitySeverity = (type) => {
  const config = getActivityTypeConfig(type);
  return config.severity || 'info';
};

// Data transformation function
const transformActivityData = (activity) => ({
  id: activity._id,
  userId: activity.userId?._id || activity.userId,
  userName: activity.userId?.name || 'Unknown User',
  userEmail: activity.userId?.email || 'Unknown Email',
  type: activity.type,
  description: activity.description,
  metadata: activity.metadata,
  ipAddress: activity.ipAddress,
  userAgent: activity.userAgent,
  timestamp: activity.createdAt,
  formattedDate: new Date(activity.createdAt).toLocaleDateString(),
  formattedTime: new Date(activity.createdAt).toLocaleTimeString(),
  deviceInfo: getDeviceInfo(activity.userAgent),
  severity: getActivitySeverity(activity.type)
});

// Transform multiple activities at once
const transformActivities = (activities) => {
  return activities.map(activity => transformActivityData(activity));
};

// Filter activities
const filterActivities = (activities, filters = {}) => {
  let filtered = [...activities];
  
  if (filters.type) {
    filtered = filtered.filter(activity => activity.type === filters.type);
  }
  
  if (filters.userId) {
    filtered = filtered.filter(activity => activity.userId === filters.userId);
  }
  
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    filtered = filtered.filter(activity => {
      const activityDate = new Date(activity.createdAt);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(activity => 
      activity.description.toLowerCase().includes(searchTerm) ||
      (activity.userName && activity.userName.toLowerCase().includes(searchTerm)) ||
      (activity.userEmail && activity.userEmail.toLowerCase().includes(searchTerm))
    );
  }
  
  return filtered;
};

// Calculate statistics
const calculateStats = (activities) => {
  const stats = {
    total: activities.length,
    byType: {},
    byUser: {},
    recent24h: 0,
    securityEvents: 0
  };
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  activities.forEach(activity => {
    // Count by type
    stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
    
    // Count by user
    if (activity.userId) {
      stats.byUser[activity.userId] = (stats.byUser[activity.userId] || 0) + 1;
    }
    
    // Count recent activities
    if (new Date(activity.createdAt) > twentyFourHoursAgo) {
      stats.recent24h++;
    }
    
    // Count security events
    const config = getActivityTypeConfig(activity.type);
    if (config.severity === 'warning' || config.severity === 'error') {
      stats.securityEvents++;
    }
  });
  
  return stats;
};

// API Methods
// Get user activities
export const getUserActivities = async (userId, params = {}) => {
  try {
    const response = await api.get(`/activities/user/${userId}`, { params });

    // Backend returns: { success: true, count: X, data: [] }
    // Normalize to canonical shape: { success, data: <array>, message }
    const payload = response?.data || {};
    // payload.data is expected to be an array for this endpoint
    return {
      success: payload.success ?? true,
      data: Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : payload.data || []),
      message: payload.message || null
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all activities (admin)
export const getAllActivities = async (params = {}) => {
  try {
    const response = await api.get('/activities', { params });
    const payload = response?.data ?? response;
    console.log('🔍 Activity Service - Raw Response:', payload);

    // Normalize to a consistent shape: { success, data: [activities], pagination }
    const activitiesArray = Array.isArray(payload.activities)
      ? payload.activities
      : Array.isArray(payload.data)
        ? payload.data
        : [];

    return {
      success: payload.success ?? true,
      data: activitiesArray,
      pagination: payload.pagination || payload.pagination || null,
      message: payload.message || null
    };
  } catch (error) {
    console.error('❌ Activity Service Error:', error);
    throw error.response?.data || error;
  }
};

// Get activity statistics
export const getActivityStats = async () => {
  try {
    const response = await api.get('/activities/stats');
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get activities by specific type
export const getActivitiesByType = async (type, params = {}) => {
  try {
    const response = await api.get('/activities', { 
      params: { ...params, type } 
    });
    const payload = response?.data || {};
    const activitiesArray = Array.isArray(payload.activities)
      ? payload.activities
      : Array.isArray(payload.data)
        ? payload.data
        : [];

    return {
      success: payload.success ?? true,
      data: activitiesArray,
      pagination: payload.pagination || null,
      message: payload.message || null
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get recent activities with limit
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await api.get('/activities', { 
      params: { limit, sort: '-createdAt' } 
    });
    const payload = response?.data ?? response;
    const activitiesArray = Array.isArray(payload.activities)
      ? payload.activities
      : Array.isArray(payload.data)
        ? payload.data
        : [];

    return {
      success: payload.success ?? true,
      data: activitiesArray,
      pagination: payload.pagination || null,
      message: payload.message || null
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search activities with advanced filters
export const searchActivities = async (query = '', filters = {}) => {
  try {
    const params = { ...filters };
    
    if (query) {
      params.search = query;
    }
    
    const response = await api.get('/activities', { params });
    const payload = response?.data ?? response;
    const activitiesArray = Array.isArray(payload.activities)
      ? payload.activities
      : Array.isArray(payload.data)
        ? payload.data
        : [];

    return {
      success: payload.success ?? true,
      data: activitiesArray,
      pagination: payload.pagination || null,
      message: payload.message || null
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Export activities (CSV format)
export const exportActivities = async (format = 'csv', filters = {}) => {
  try {
    const response = await api.get('/activities/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return { success: true, data: response?.data ?? response, message: 'Export ready' };
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Enhanced activity service
export const activityService = {
  // Core API methods
  getUserActivities,
  getAllActivities,
  getActivityStats,
  getActivitiesByType,
  getRecentActivities,
  searchActivities,
  exportActivities,

  // Data transformation methods
  transformActivityData,
  transformActivities,
  getActivityTypeConfig,

  // Utility methods
  filterActivities,
  calculateStats
};

export default activityService;