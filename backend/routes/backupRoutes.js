import express from 'express';
import backupController from '../controllers/backupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Google Drive OAuth
router.get('/auth/url', backupController.getAuthUrl);
router.get('/auth/callback', backupController.handleAuthCallback);

// Manual start (protected)
router.post('/start', protect, backupController.startManualBackup);

// Status and history
router.get('/status', protect, backupController.getStatus);
router.get('/history', protect, backupController.getHistory);
router.get('/download', protect, backupController.downloadFile);

// Restore
router.post('/restore', protect, backupController.restoreBackup);

export default router;
