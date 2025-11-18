// routes/adminSettingsRoutes.js
import express from 'express';
import {
  getSettings,
  updateSettings,
  sendTestEmail
} from '../controllers/adminSettingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Settings routes
router.get('/', getSettings);
router.put('/', updateSettings);

// Utility routes
router.post('/test-email', sendTestEmail);

export { router as adminSettingsRoutes };