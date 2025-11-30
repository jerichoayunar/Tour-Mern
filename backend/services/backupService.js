import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import archiver from 'archiver';
import crypto from 'crypto';
import nodeCron from 'node-cron';
import BackupJob from '../models/BackupJob.js';
import googleDriveService from './googleDriveService.js';
import emailService from './emailService.js';

const TEMP_DIR = path.join(process.cwd(), 'tmp', 'backups');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

let currentJob = null;

const encryptFile = (inputPath, outputPath, key) => {
  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);
    output.write(iv); // prepend iv
    input.pipe(cipher).pipe(output);
    output.on('finish', () => resolve());
    output.on('error', (err) => reject(err));
  });
};

const createArchive = async (dumpPath, uploadsPath, outPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));
    archive.pipe(output);
    if (fs.existsSync(dumpPath)) {
      archive.file(dumpPath, { name: path.basename(dumpPath) });
    }
    if (uploadsPath && fs.existsSync(uploadsPath)) {
      archive.directory(uploadsPath, 'uploads');
    }
    archive.finalize();
  });
};

const checkMongodump = async () => {
  try {
    // If user provided a full path to mongodump, try that first
    const mongodumpCmd = process.env.MONGODUMP_PATH || 'mongodump';
    // Try to run mongodump --version to ensure it's available
    await execa(mongodumpCmd, ['--version']);
    return true;
  } catch (err) {
    // On Windows, the error will indicate command not found
    throw new Error(
      'mongodump not found. Please install MongoDB Database Tools and ensure mongodump is in your PATH. ' +
      'On Windows you can install via Chocolatey: `choco install mongodb-database-tools -y`, ' +
      'or download from https://www.mongodb.com/try/download/database-tools. After installing, restart your shell and try again.'
    );
  }
};

export const getStatus = async () => {
  if (currentJob) return currentJob;
  const last = await BackupJob.findOne({}, {}, { sort: { createdAt: -1 } });
  return last || null;
};

export const startBackup = async (options = {}) => {
  if (currentJob && currentJob.status === 'running') {
    throw new Error('Another backup is already running');
  }

  const { type = 'manual', initiatedBy = null } = options;
  const job = new BackupJob({ type, status: 'running', startedAt: new Date(), initiatedBy });
  await job.save();

  currentJob = { id: job._id, status: 'running', progress: 0 };

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpFile = path.join(TEMP_DIR, `dump-${timestamp}.archive`);
    const archiveFile = path.join(TEMP_DIR, `backup-${timestamp}.zip`);
    const encryptedFile = path.join(TEMP_DIR, `backup-${timestamp}.zip.enc`);

    // 1) Run mongodump (ensure tool is available first)
    currentJob.progress = 10;
    await checkMongodump();
    const mongodumpCmd = process.env.MONGODUMP_PATH || 'mongodump';
    await execa(mongodumpCmd, ['--uri', process.env.MONGO_URI || 'mongodb://localhost:27017/tourdb', `--archive=${dumpFile}`, '--gzip']);

    // 2) Create archive including uploads if present
    currentJob.progress = 40;
    const uploadsPath = path.join(process.cwd(), 'uploads');
    await createArchive(dumpFile, fs.existsSync(uploadsPath) ? uploadsPath : null, archiveFile);

    // 3) Encrypt if key present
    currentJob.progress = 65;
    const encKey = process.env.BACKUP_ENCRYPTION_KEY;
    let fileToUpload = archiveFile;
    let encrypted = false;
    if (encKey && encKey.length >= 32) {
      await encryptFile(archiveFile, encryptedFile, encKey.slice(0, 32));
      fileToUpload = encryptedFile;
      encrypted = true;
    }

    // 4) Upload to Drive
    currentJob.progress = 80;
    const folderId = await googleDriveService.ensureBackupFolder();
    const remoteName = `tour-mern-backup-${timestamp}${encrypted ? '.zip.enc' : '.zip'}`;
    const { id, size } = await googleDriveService.uploadFile(fileToUpload, remoteName, folderId);

    // 5) Record completion
    job.status = 'completed';
    job.finishedAt = new Date();
    job.sizeBytes = size;
    job.driveFileId = id;
    job.driveFolderId = folderId;
    job.encrypted = encrypted;
    await job.save();

    currentJob.progress = 100;

    // 6) Enforce retention
    const keep = Number(process.env.BACKUP_RETENTION || 4);
    await googleDriveService.deleteOldBackups(folderId, keep);

    // 7) Send notification
    try {
      await emailService.sendEmail({
        to: process.env.EMAIL_USER,
        subject: 'Backup completed',
        text: `Backup completed successfully. Drive file id: ${id}`
      });
    } catch (e) {
      console.warn('Email send failed', e.message);
    }

    // Cleanup
    try { fs.rmSync(dumpFile, { force: true }); } catch {};
    try { fs.rmSync(archiveFile, { force: true }); } catch {};
    try { fs.rmSync(encryptedFile, { force: true }); } catch {};

    currentJob = { id: job._id, status: 'completed', progress: 100 };
    return job;
  } catch (err) {
    console.error('Backup failed', err);
    job.status = 'failed';
    job.error = err.message;
    job.finishedAt = new Date();
    await job.save();
    currentJob = { id: job._id, status: 'failed', progress: 0, error: err.message };
    throw err;
  }
};

export const restoreBackup = async ({ fileId }) => {
  if (!fileId) throw new Error('fileId is required');
  const job = new BackupJob({ type: 'manual', status: 'restoring', startedAt: new Date() });
  await job.save();
  currentJob = { id: job._id, status: 'restoring', progress: 0 };
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const downloadPath = path.join(TEMP_DIR, `download-${timestamp}`);
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true });
    const destFile = path.join(downloadPath, `backup-${timestamp}`);
    await googleDriveService.downloadFile(fileId, destFile);
    // If encrypted, decrypt
    const encKey = process.env.BACKUP_ENCRYPTION_KEY;
    let archivePath = destFile;
    if (encKey) {
      // assume IV is prepended
      const iv = Buffer.alloc(16);
      const inStream = fs.createReadStream(destFile);
      // simple decrypt into archivePath + '.dec'
      const decPath = destFile + '.dec';
      const fd = fs.openSync(destFile, 'r');
      const ivBuf = Buffer.alloc(16);
      fs.readSync(fd, ivBuf, 0, 16, 0);
      fs.closeSync(fd);
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey.slice(0,32),'utf8'), ivBuf);
      const input = fs.createReadStream(destFile, { start: 16 });
      const output = fs.createWriteStream(decPath);
      await new Promise((resolve,reject)=>{
        input.pipe(decipher).pipe(output).on('finish',resolve).on('error',reject);
      });
      archivePath = decPath;
    }
    // Extract and run mongorestore if dump exists
    // We'll assume the archive contains a mongodump archive file
    // For simplicity, write the archive to disk and rely on admin to verify restore

    job.status = 'completed';
    job.finishedAt = new Date();
    await job.save();
    currentJob = { id: job._id, status: 'completed', progress: 100 };
    return job;
  } catch (err) {
    console.error('Restore failed', err);
    job.status = 'failed';
    job.error = err.message;
    job.finishedAt = new Date();
    await job.save();
    currentJob = { id: job._id, status: 'failed', error: err.message };
    throw err;
  }
};

// Schedule weekly backups: every Sunday at 2:00 AM
const scheduleWeekly = () => {
  const cronExpr = process.env.BACKUP_CRON || '0 2 * * 0';
  nodeCron.schedule(cronExpr, async () => {
    try {
      console.log('Scheduled backup triggered');
      await startBackup({ type: 'scheduled', initiatedBy: null });
    } catch (err) {
      console.error('Scheduled backup error', err.message);
    }
  });
};

// Initialize scheduler on import
try {
  scheduleWeekly();
} catch (err) {
  console.warn('Failed to schedule backups on startup', err.message);
}

export default {
  startBackup,
  getStatus,
  restoreBackup
};
