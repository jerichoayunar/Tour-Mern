// routes/settingsRoutes.js
import express from 'express';
import { getPublicSettings } from '../controllers/settingsController.js';

const router = express.Router();

// Public route - no authentication required
router.get('/public', getPublicSettings);

export { router as settingsRoutes };
