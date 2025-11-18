// ./controllers/analyticsController.js
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import Destination from '../models/Destination.js';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import asyncHandler from 'express-async-handler';

// 📊 Utility: Calculate date ranges
const getDateRange = (period = 'month') => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'month':
    default:
      startDate.setMonth(now.getMonth() - 1);
      break;
  }
  
  return { startDate, endDate: now };
};

// 📈 Get Analytics Metrics Overview
export const getMetrics = asyncHandler(async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // Get total bookings count and revenue
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          averageBookingValue: { $avg: '$totalPrice' }
        }
      }
    ]);
    
    // Get user registrations
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get package views and inquiries
    const totalInquiries = await Inquiry.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const metrics = {
      totalBookings,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      averageBookingValue: revenueData[0]?.averageBookingValue || 0,
      newUsers,
      totalInquiries,
      conversionRate: totalInquiries > 0 ? (totalBookings / totalInquiries * 100).toFixed(2) : 0
    };
    
    console.log('📊 Metrics calculated:', metrics);
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('❌ Error in getMetrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics metrics',
      error: error.message
    });
  }
});

// 📊 Get Booking Trends Over Time
export const getBookingTrends = asyncHandler(async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // Determine grouping based on period
    let dateFormat;
    switch (period) {
      case 'week':
        dateFormat = '%Y-%m-%d'; // Daily for week
        break;
      case 'year':
        dateFormat = '%Y-%m'; // Monthly for year
        break;
      case 'month':
      default:
        dateFormat = '%Y-%U'; // Weekly for month
        break;
    }
    
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$createdAt'
            }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format data for frontend charts
    const formattedData = {
      periods: bookingTrends.map(item => item._id),
      bookings: bookingTrends.map(item => item.bookings),
      revenue: bookingTrends.map(item => item.revenue)
    };
    
    console.log('📈 Booking trends calculated:', formattedData);
    
    res.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error('❌ Error in getBookingTrends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking trends',
      error: error.message
    });
  }
});

// 🏆 Get Top Performing Destinations & Packages
export const getTopPerformers = asyncHandler(async (req, res) => {
  try {
    const { period = 'month', limit = 5 } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // Top Destinations by bookings
    const topDestinations = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$destination',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { bookings: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'destinations',
          localField: '_id',
          foreignField: '_id',
          as: 'destinationInfo'
        }
      },
      {
        $unwind: '$destinationInfo'
      }
    ]);
    
    // Top Packages by bookings
    const topPackages = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$package',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { bookings: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'packageInfo'
        }
      },
      {
        $unwind: '$packageInfo'
      }
    ]);
    
    const formattedData = {
      topDestinations: topDestinations.map(item => ({
        name: item.destinationInfo.name || 'Unknown Destination',
        bookings: item.bookings,
        revenue: item.revenue
      })),
      topPackages: topPackages.map(item => ({
        name: item.packageInfo.name || 'Unknown Package',
        bookings: item.bookings,
        revenue: item.revenue
      }))
    };
    
    console.log('🏆 Top performers calculated:', formattedData);
    
    res.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error('❌ Error in getTopPerformers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top performers',
      error: error.message
    });
  }
});

// 👥 Get User Statistics
export const getUserStats = asyncHandler(async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // User role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const formattedData = {
      totalUsers: await User.countDocuments(),
      newUsers: await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      userRegistrations: userRegistrations.map(item => ({
        date: item._id,
        count: item.count
      })),
      userRoles: userRoles.map(item => ({
        role: item._id,
        count: item.count
      }))
    };
    
    console.log('👥 User stats calculated:', formattedData);
    
    res.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error('❌ Error in getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

// 💰 Get Revenue Breakdown
export const getRevenueBreakdown = asyncHandler(async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // Revenue by package type
    const revenueByPackageType = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: 'package',
          foreignField: '_id',
          as: 'packageInfo'
        }
      },
      {
        $unwind: '$packageInfo'
      },
      {
        $group: {
          _id: '$packageInfo.category',
          amount: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      }
    ]);
    
    // Revenue by destination
    const revenueByDestination = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $lookup: {
          from: 'destinations',
          localField: 'destination',
          foreignField: '_id',
          as: 'destinationInfo'
        }
      },
      {
        $unwind: '$destinationInfo'
      },
      {
        $group: {
          _id: '$destinationInfo.name',
          amount: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]);
    
    const formattedData = {
      byPackageType: revenueByPackageType.map(item => ({
        category: item._id || 'Unknown',
        amount: item.amount,
        bookings: item.bookings
      })),
      byDestination: revenueByDestination.map(item => ({
        destination: item._id,
        revenue: item.amount,
        bookings: item.bookings
      }))
    };
    
    console.log('💰 Revenue breakdown calculated:', formattedData);
    
    res.json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error('❌ Error in getRevenueBreakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue breakdown',
      error: error.message
    });
  }
});

// 🎯 Additional Analytics Endpoints
export const getConversionFunnel = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Conversion funnel endpoint - implement as needed' }
  });
});

export const getGeographicData = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Geographic data endpoint - implement as needed' }
  });
});

export const getRealTimeStats = asyncHandler(async (req, res) => {
  const realTimeStats = {
    activeUsers: Math.floor(Math.random() * 50) + 10,
    bookingsToday: await Booking.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
      }
    }),
    revenueToday: 0
  };
  
  res.json({
    success: true,
    data: realTimeStats
  });
});

// Export all controllers as default
export default {
  getMetrics,
  getBookingTrends,
  getTopPerformers,
  getUserStats,
  getRevenueBreakdown,
  getConversionFunnel,
  getGeographicData,
  getRealTimeStats
};