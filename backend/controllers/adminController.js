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
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to get month name
function getMonthName(monthNumber) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNumber - 1];
}

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