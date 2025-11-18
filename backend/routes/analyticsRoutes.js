// ./routes/analyticsRoutes.js
import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All analytics routes are protected and admin-only
router.use(protect);
router.use(admin);

// 📊 Analytics Dashboard Routes
router.get('/metrics', analyticsController.getMetrics);
router.get('/booking-trends', analyticsController.getBookingTrends);
router.get('/top-performers', analyticsController.getTopPerformers);
router.get('/user-stats', analyticsController.getUserStats);
router.get('/revenue-breakdown', analyticsController.getRevenueBreakdown);

// 🎯 Additional Analytics Endpoints
router.get('/conversion-funnel', analyticsController.getConversionFunnel);
router.get('/geographic-data', analyticsController.getGeographicData);
router.get('/real-time-stats', analyticsController.getRealTimeStats);

export default router;