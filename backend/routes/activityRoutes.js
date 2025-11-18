// backend/routes/activityRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getUserActivities,
  getAllActivities,
  getActivityStats
} from '../controllers/activityController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllActivities);
router.get('/stats', getActivityStats);
router.get('/user/:userId', getUserActivities);

export { router as activityRoutes };