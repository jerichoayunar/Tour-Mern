import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getRecentBookings,
  getRevenueStats,
  getAnalyticsMetrics,
  getBookingTrends,
  getTopPerformers,
  getUserStats,
  getRevenueBreakdown
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-bookings', getRecentBookings);
router.get('/dashboard/revenue-stats', getRevenueStats);

// Analytics routes
router.get('/analytics/metrics', getAnalyticsMetrics);
router.get('/analytics/booking-trends', getBookingTrends);
router.get('/analytics/top-performers', getTopPerformers);
router.get('/analytics/user-stats', getUserStats);
router.get('/analytics/revenue-breakdown', getRevenueBreakdown);

export { router as adminRoutes };