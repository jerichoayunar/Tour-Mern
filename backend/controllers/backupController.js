import BackupJob from '../models/BackupJob.js';
import backupService from '../services/backupService.js';
import googleDriveService from '../services/googleDriveService.js';
import fs from 'fs';
import path from 'path';

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
  const { fileId, targetDb = 'tourdb_restore', confirmation } = req.body || {};
  if (!fileId) return res.status(400).json({ message: 'fileId is required' });
  // If restoring to production database name (assume 'tourdb'), enforce typed confirmation and admin role
  const isProd = targetDb === 'tourdb' || targetDb === 'production' || targetDb === 'prod';
  if (isProd) {
    // require logged-in user and admin role
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin users may perform production restores' });
    if (confirmation !== 'RESTORE_PRODUCTION') return res.status(400).json({ message: "To restore production provide confirmation: 'RESTORE_PRODUCTION'" });
  }
  try {
    const job = await backupService.restoreBackup({ fileId, targetDb });
    return res.json({ job });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) return res.status(400).json({ message: 'fileId query param is required' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tmp = path.join(process.cwd(), 'tmp', 'backups', `download-${timestamp}`);
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
    const dest = path.join(tmp, `file-${fileId}`);
    await googleDriveService.downloadFile(fileId, dest);
    return res.download(dest, err => {
      // cleanup after download
      try { fs.rmSync(dest); fs.rmdirSync(tmp); } catch(e){}
    });
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
  ,downloadFile
};
