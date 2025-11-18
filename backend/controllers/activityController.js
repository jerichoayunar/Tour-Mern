// backend/controllers/activityController.js
import * as activityService from '../services/activityService.js';
import Activity from '../models/Activity.js'; // ✅ ADD THIS IMPORT
import ApiError from '../utils/ApiError.js';

// @desc    Get user activities
// @route   GET /api/activities/user/:userId
// @access  Private/Admin
export const getUserActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getUserActivities(req.params.userId);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all activities (admin)
// @route   GET /api/activities
// @access  Private/Admin
export const getAllActivities = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    
    const filters = {};
    if (type) filters.type = type;

    const result = await activityService.getAllActivities(filters, parseInt(limit), parseInt(page));
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private/Admin
export const getActivityStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalActivities = await Activity.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalLast30Days: totalActivities,
        byType: stats
      }
    });
  } catch (error) {
    next(error);
  }
};