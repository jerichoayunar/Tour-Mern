// controllers/adminController.js - COMPLETE UPDATED VERSION
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Package from '../models/Package.js';
import Destination from '../models/Destination.js';

// ============================================================================
// DASHBOARD CONTROLLERS
// ============================================================================

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBookings,
      totalPackages,
      totalRevenue,
      monthlyBookings,
      destinationPopularity
    ] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Package.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Monthly bookings data for chart
      Booking.aggregate([
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]),
      // Destination popularity data for chart
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        {
          $lookup: {
            from: 'packages',
            localField: 'package',
            foreignField: '_id',
            as: 'packageData'
          }
        },
        { $unwind: '$packageData' },
        {
          $group: {
            _id: '$packageData.destination',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Format monthly bookings data for chart
    const monthlyBookingsFormatted = monthlyBookings.map(item => ({
      month: getMonthName(item._id.month),
      bookings: item.count
    }));

    // Format destination popularity data for chart
    const destinationPopularityFormatted = destinationPopularity.map(item => ({
      name: item._id,
      value: item.count
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        totalPackages,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyBookings: monthlyBookingsFormatted,
        destinationPopularity: destinationPopularityFormatted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

export const getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('package', 'name price destination')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent bookings',
      error: error.message
    });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: revenueStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue stats',
      error: error.message
    });
  }
};

// ============================================================================
// ANALYTICS CONTROLLERS
// ============================================================================

/**
 * @desc    Get analytics metrics overview
 * @route   GET /api/admin/analytics/metrics
 * @access  Private/Admin
 */
export const getAnalyticsMetrics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;
    
    // Calculate date ranges based on period
    const dateRange = calculateDateRange(period, startDate, endDate);
    
    // Get current period stats
    const currentBookings = await Booking.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });
    
    const currentRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: dateRange.start, $lte: dateRange.end } 
    });
    
    const activeDestinations = await Destination.countDocuments({ status: 'active' });
    const totalPackages = await Package.countDocuments({ status: 'active' });
    
    // Calculate growth percentages (compare with previous period)
    const previousPeriod = calculateDateRange(period, startDate, endDate, true);
    const previousBookings = await Booking.countDocuments({
      createdAt: { $gte: previousPeriod.start, $lte: previousPeriod.end }
    });
    
    const previousRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriod.start, $lte: previousPeriod.end },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const bookingGrowth = previousBookings > 0 
      ? ((currentBookings - previousBookings) / previousBookings * 100).toFixed(1)
      : currentBookings > 0 ? 100 : 0;

    const revenueTotal = currentRevenue[0]?.total || 0;
    const previousRevenueTotal = previousRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenueTotal > 0 
      ? ((revenueTotal - previousRevenueTotal) / previousRevenueTotal * 100).toFixed(1)
      : revenueTotal > 0 ? 100 : 0;

    // Calculate conversion rate (users with bookings / total users)
    const usersWithBookings = await Booking.distinct('user', {
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });
    const totalUsersInPeriod = await User.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });
    const conversionRate = totalUsersInPeriod > 0 
      ? ((usersWithBookings.length / totalUsersInPeriod) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalBookings: currentBookings,
        totalRevenue: revenueTotal,
        newUsers,
        activeDestinations,
        totalPackages,
        bookingGrowth: parseFloat(bookingGrowth),
        revenueGrowth: parseFloat(revenueGrowth),
        conversionRate: parseFloat(conversionRate)
      }
    });
  } catch (error) {
    console.error('Analytics metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics metrics',
      error: error.message
    });
  }
};

/**
 * @desc    Get booking trends data
 * @route   GET /api/admin/analytics/booking-trends
 * @access  Private/Admin
 */
export const getBookingTrends = async (req, res) => {
  try {
    const { startDate, endDate, period = 'monthly' } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    } else {
      // Default to last 12 months
      dateFilter.createdAt = {
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      };
    }

    let groupStage;
    switch (period) {
      case 'daily':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          }
        };
        break;
      case 'weekly':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          }
        };
        break;
      case 'monthly':
      default:
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          }
        };
        break;
    }

    const bookingTrends = await Booking.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          ...groupStage,
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);

    // Transform data for frontend
    const periods = [];
    const bookings = [];
    const revenue = [];

    bookingTrends.forEach(item => {
      let periodLabel;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      if (period === 'daily') {
        periodLabel = `${monthNames[item._id.month - 1]} ${item._id.day}`;
      } else if (period === 'weekly') {
        periodLabel = `Week ${item._id.week}`;
      } else {
        periodLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      }
      
      periods.push(periodLabel);
      bookings.push(item.bookings);
      revenue.push(item.revenue);
    });

    res.json({
      success: true,
      data: {
        periods,
        bookings,
        revenue
      }
    });
  } catch (error) {
    console.error('Booking trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking trends',
      error: error.message
    });
  }
};

/**
 * @desc    Get top performing destinations and packages
 * @route   GET /api/admin/analytics/top-performers
 * @access  Private/Admin
 */
export const getTopPerformers = async (req, res) => {
  try {
    const { limit = 5, startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Top destinations
    const topDestinations = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: 'package',
          foreignField: '_id',
          as: 'packageData'
        }
      },
      {
        $unwind: '$packageData'
      },
      {
        $group: {
          _id: '$packageData.destination',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Top packages
    const topPackages = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: 'package',
          foreignField: '_id',
          as: 'packageData'
        }
      },
      {
        $unwind: '$packageData'
      },
      {
        $group: {
          _id: '$packageData.title',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: {
        topDestinations: topDestinations.map(item => ({
          name: item._id || 'Unknown Destination',
          bookings: item.bookings,
          revenue: item.revenue
        })),
        topPackages: topPackages.map(item => ({
          name: item._id || 'Unknown Package',
          bookings: item.bookings,
          revenue: item.revenue
        }))
      }
    });
  } catch (error) {
    console.error('Top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top performers',
      error: error.message
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/admin/analytics/user-stats
 * @access  Private/Admin
 */
export const getUserStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments(dateFilter);
    
    // Active users (users with at least one booking in the period)
    const activeUsers = await Booking.distinct('user', dateFilter);
    
    // User growth calculation (compare with previous 30 days)
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 60); // 60 days ago
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30); // 30 days ago
    
    const previousNewUsers = await User.countDocuments({
      createdAt: { 
        $gte: previousPeriodStart, 
        $lte: previousPeriodEnd 
      }
    });
    
    const userGrowth = previousNewUsers > 0 
      ? ((newUsers - previousNewUsers) / previousNewUsers * 100).toFixed(1)
      : newUsers > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth: newUsers,
        userGrowth: parseFloat(userGrowth),
        activeUsers: activeUsers.length
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get revenue breakdown
 * @route   GET /api/admin/analytics/revenue-breakdown
 * @access  Private/Admin
 */
export const getRevenueBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    } else {
      // Default to last 30 days
      dateFilter.createdAt = {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
    }

    // Revenue by package category/type
    const revenueByPackageType = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: 'package',
          foreignField: '_id',
          as: 'packageData'
        }
      },
      {
        $unwind: '$packageData'
      },
      {
        $group: {
          _id: '$packageData.category', // Adjust based on your package model
          amount: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]);

    // Revenue by destination
    const revenueByDestination = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: 'package',
          foreignField: '_id',
          as: 'packageData'
        }
      },
      {
        $unwind: '$packageData'
      },
      {
        $group: {
          _id: '$packageData.destination',
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        byPackageType: revenueByPackageType.map(item => ({
          category: item._id || 'General',
          amount: item.amount
        })),
        byDestination: revenueByDestination.map(item => ({
          destination: item._id || 'Unknown Destination',
          revenue: item.revenue
        }))
      }
    });
  } catch (error) {
    console.error('Revenue breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue breakdown',
      error: error.message
    });
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to get month name
function getMonthName(monthNumber) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNumber - 1];
}

// Helper function to calculate date ranges
const calculateDateRange = (period, startDate, endDate, previous = false) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (previous) {
      const diff = end.getTime() - start.getTime();
      return {
        start: new Date(start.getTime() - diff),
        end: new Date(end.getTime() - diff)
      };
    }
    return { start, end };
  }

  const now = new Date();
  let start, end = now;

  switch (period) {
    case 'week':
      start = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      start = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      start = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      start = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      start = new Date(now.setMonth(now.getMonth() - 1));
  }

  if (previous) {
    const diff = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - diff),
      end: new Date(end.getTime() - diff)
    };
  }

  return { start, end };
};

/**
 * @desc    Export dashboard data as CSV or JSON
 * @route   GET /api/admin/dashboard/export
 * @access  Private/Admin
 */
export const exportDashboardData = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBookings,
      totalPackages,
      totalRevenue,
      monthlyBookings,
      destinationPopularity
    ] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Package.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        {
          $lookup: {
            from: 'packages',
            localField: 'package',
            foreignField: '_id',
            as: 'packageData'
          }
        },
        { $unwind: '$packageData' },
        {
          $group: {
            _id: '$packageData.destination',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const monthlyBookingsFormatted = monthlyBookings.map(item => ({
      month: getMonthName(item._id.month),
      bookings: item.count
    }));

    const destinationPopularityFormatted = destinationPopularity.map(item => ({
      name: item._id,
      value: item.count
    }));

    const payload = {
      totalUsers,
      totalBookings,
      totalPackages,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyBookings: monthlyBookingsFormatted,
      destinationPopularity: destinationPopularityFormatted
    };

    const format = (req.query.format || 'json').toLowerCase();

    if (format === 'csv') {
      // Build a simple CSV: metric,value - arrays are JSON-encoded
      const rows = [];
      rows.push(["metric", "value"]);
      rows.push(["totalUsers", String(payload.totalUsers)]);
      rows.push(["totalBookings", String(payload.totalBookings)]);
      rows.push(["totalPackages", String(payload.totalPackages)]);
      rows.push(["totalRevenue", String(payload.totalRevenue)]);
      rows.push(["monthlyBookings", JSON.stringify(payload.monthlyBookings)]);
      rows.push(["destinationPopularity", JSON.stringify(payload.destinationPopularity)]);

      // Convert to CSV string with proper quoting
      const escapeCsv = v => '"' + String(v).replace(/"/g, '""') + '"';
      const csv = rows.map(r => r.map(escapeCsv).join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dashboard_export.csv"');
      return res.status(200).send(csv);
    }

    // Default JSON
    return res.json({ success: true, data: payload });
  } catch (error) {
    console.error('Export dashboard error:', error);
    res.status(500).json({ success: false, message: 'Error exporting dashboard data', error: error.message });
  }
};