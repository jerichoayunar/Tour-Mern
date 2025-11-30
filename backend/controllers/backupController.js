import BackupJob from '../models/BackupJob.js';
import backupService from '../services/backupService.js';
import googleDriveService from '../services/googleDriveService.js';

// Controller helpers for backup endpoints

export const getAuthUrl = async (req, res) => {
  try {
    const url = googleDriveService.getAuthUrl();
    return res.json({ url });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const handleAuthCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ message: 'Missing code in query' });
  try {
    const tokens = await googleDriveService.setTokensFromCode(code);
    return res.json({ message: 'Authorized', tokens });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const startManualBackup = async (req, res) => {
  try {
    const job = await backupService.startBackup({ type: 'manual', initiatedBy: req.user?.id || null });
    return res.json({ job });
  } catch (err) {
    // If service throws a clear error, return 500 with message
    const statusCode = err.message && err.message.toLowerCase().includes('not found') ? 500 : 500;
    return res.status(statusCode).json({ message: err.message });
  }
};

export const getStatus = async (req, res) => {
  try {
    const status = await backupService.getStatus();
    return res.json({ status });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const jobs = await BackupJob.find({}).sort({ createdAt: -1 }).limit(50);
    return res.json({ jobs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const restoreBackup = async (req, res) => {
  const { fileId } = req.body || {};
  if (!fileId) return res.status(400).json({ message: 'fileId is required' });
  try {
    const job = await backupService.restoreBackup({ fileId });
    return res.json({ job });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export default {
  getAuthUrl,
  handleAuthCallback,
  startManualBackup,
  getStatus,
  getHistory,
  restoreBackup
};
