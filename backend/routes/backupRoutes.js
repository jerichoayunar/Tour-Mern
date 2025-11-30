import express from 'express';
import backupController from '../controllers/backupController.js';

const router = express.Router();

// Google Drive OAuth
router.get('/auth/url', backupController.getAuthUrl);
router.get('/auth/callback', backupController.handleAuthCallback);

// Manual start
router.post('/start', backupController.startManualBackup);

// Status and history
router.get('/status', backupController.getStatus);
router.get('/history', backupController.getHistory);

// Restore
router.post('/restore', backupController.restoreBackup);

export default router;
