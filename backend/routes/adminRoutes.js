import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getRecentBookings,
  getRevenueStats,
  exportDashboardData
  , exportBookings
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-bookings', getRecentBookings);
router.get('/dashboard/revenue-stats', getRevenueStats);
router.get('/dashboard/export', exportDashboardData);
// Bookings export (CSV/JSON)
router.get('/bookings/export', exportBookings);

// Note: Analytics routes removed (frontend-only analytics UI removed).

export { router as adminRoutes };