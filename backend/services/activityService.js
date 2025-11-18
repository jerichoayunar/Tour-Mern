// backend/services/activityService.js
import Activity from '../models/Activity.js';
import ApiError from '../utils/ApiError.js';

// Log new activity
export const logActivity = async (activityData) => {
  try {
    // Validate required fields
    if (!activityData.userId) {
      console.log('Activity logging failed: Missing userId');
      return null;
    }
    
    if (!activityData.type) {
      console.log('Activity logging failed: Missing activity type');
      return null;
    }
    
    if (!activityData.description) {
      console.log('Activity logging failed: Missing description');
      return null;
    }
    
    const activity = new Activity(activityData);
    await activity.save();
    
    return activity;
  } catch (error) {
    console.error('Activity logging failed:', error.message);
    
    // Don't throw error - activity logging shouldn't break main functionality
    return null;
  }
};

// Get user activities
export const getUserActivities = async (userId, limit = 50) => {
  try {
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return activities;
  } catch (error) {
    console.error('Failed to get user activities:', error.message);
    return [];
  }
};

// Get activities by type
export const getActivitiesByType = async (type, limit = 100) => {
  try {
    const activities = await Activity.find({ type })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return activities;
  } catch (error) {
    console.error('Failed to get activities by type:', error.message);
    return [];
  }
};

// Get all activities (admin only)
export const getAllActivities = async (filters = {}, limit = 100, page = 1) => {
  try {
    const skip = (page - 1) * limit;
    
    const activities = await Activity.find(filters)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Activity.countDocuments(filters);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Failed to get all activities:', error.message);
    return {
      activities: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    };
  }
};