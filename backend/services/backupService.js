import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import archiver from 'archiver';
import crypto from 'crypto';
import nodeCron from 'node-cron';
import BackupJob from '../models/BackupJob.js';
import Package from '../models/Package.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Destination from '../models/Destination.js';
import Inquiry from '../models/Inquiry.js';
import googleDriveService from './googleDriveService.js';
import emailService from './emailService.js';
import unzipper from 'unzipper';

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

    // 4b) Generate human-readable summary and upload it as a separate file
    try {
      const summary = {};
      // Basic metadata
      summary.timestamp = new Date().toISOString();
      summary.backupFile = remoteName;
      summary.sizeBytes = size;
      // Collection stats
      summary.collections = {
        packages: await Package.countDocuments(),
        users: await User.countDocuments(),
        bookings: await Booking.countDocuments()
      };
      // Package/tour counts
      summary.tourCounts = {
        total: await Package.countDocuments(),
        active: await Package.countDocuments({ archived: false, status: 'active' }),
        archived: await Package.countDocuments({ archived: true })
      };
      // Cloudinary image count
      summary.cloudinary = {
        packagesWithImage: await Package.countDocuments({ 'image.isUploaded': true })
      };
      // Sample tours (safe fields only)
      const samples = await Package.find({}).limit(10).select('title price duration itinerary image').lean();
      summary.sampleTours = samples.map(s => ({
        title: s.title,
        price: s.price,
        duration: s.duration,
        itineraryDays: Array.isArray(s.itinerary) ? s.itinerary.length : 0,
        imageUrl: s.image?.url || null
      }));

      // Users: count + safe samples (no emails/passwords)
      const userCount = await User.countDocuments();
      const userSamples = await User.find({}).limit(10).select('name role createdAt').lean();
      summary.users = { count: userCount, samples: userSamples };

      // Bookings: count + safe samples (omit client email/phone/payment info)
      const bookingCount = await Booking.countDocuments();
      const bookingSamples = await Booking.find({}).limit(10).select('bookingDate status clientName totalPrice package').populate('package','title').lean();
      summary.bookings = { count: bookingCount, samples: bookingSamples.map(b => ({ bookingDate: b.bookingDate, status: b.status, clientName: b.clientName, totalPrice: b.totalPrice, packageTitle: b.package?.title || null })) };

      // Destinations
      const destCount = await Destination.countDocuments();
      const destSamples = await Destination.find({}).limit(10).select('name location status').lean();
      summary.destinations = { count: destCount, samples: destSamples };

      // Inquiries
      const inquiryCount = await Inquiry.countDocuments();
      const inquirySamples = await Inquiry.find({}).limit(10).select('subject status createdAt').lean();
      summary.inquiries = { count: inquiryCount, samples: inquirySamples };

      // Uploads folder file count (if local uploads exist)
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        let uploadFiles = 0;
        if (fs.existsSync(uploadsDir)) {
          const walk = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const e of entries) {
              const p = path.join(dir, e.name);
              if (e.isDirectory()) walk(p); else uploadFiles++;
            }
          };
          walk(uploadsDir);
        }
        summary.uploads = { files: uploadFiles };
      } catch (e) {
        summary.uploads = { files: null };
      }
      // App version from package.json if available
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(),'package.json'),'utf8'));
        summary.appVersion = pkg.version || null;
      } catch (e) {}

      const summaryPath = path.join(TEMP_DIR, `backup-summary-${timestamp}.json`);
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

      const summaryRemoteName = `backup-summary-${timestamp}.json`;
      const summaryUpload = await googleDriveService.uploadFile(summaryPath, summaryRemoteName, folderId);
      // store summary info in job
      job.files = job.files || [];
      job.files.push({ name: remoteName, path: null, size });
      job.files.push({ name: summaryRemoteName, path: null, size: summaryUpload.size || 0 });
      job.summaryDriveFileId = summaryUpload.id;
      await job.save();
      // cleanup summary file
      try { fs.rmSync(summaryPath, { force: true }); } catch {}
    } catch (err) {
      console.warn('Failed to create/upload summary', err.message);
    }

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

export const restoreBackup = async ({ fileId, targetDb = 'tourdb_restore' }) => {
  if (!fileId) throw new Error('fileId is required');
  const job = new BackupJob({ type: 'manual', status: 'restoring', startedAt: new Date() });
  await job.save();
  currentJob = { id: job._id, status: 'restoring', progress: 0 };
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const downloadPath = path.join(TEMP_DIR, `download-${timestamp}`);
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true });
    const destFile = path.join(downloadPath, `backup-${timestamp}.zip`);

    // 1) Download file from Drive
    currentJob.progress = 10;
    await googleDriveService.downloadFile(fileId, destFile);
    currentJob.progress = 30;

    // 2) Attempt decrypt if key present (decrypt into .dec)
    let workingZip = destFile;
    const encKey = process.env.BACKUP_ENCRYPTION_KEY;
    if (encKey && encKey.length >= 32) {
      try {
        const fd = fs.openSync(destFile, 'r');
        const ivBuf = Buffer.alloc(16);
        fs.readSync(fd, ivBuf, 0, 16, 0);
        fs.closeSync(fd);
        const decPath = destFile + '.dec';
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey.slice(0,32),'utf8'), ivBuf);
        const input = fs.createReadStream(destFile, { start: 16 });
        const output = fs.createWriteStream(decPath);
        await new Promise((resolve,reject)=>{ input.pipe(decipher).pipe(output).on('finish',resolve).on('error',reject); });
        workingZip = decPath;
      } catch (e) {
        // decryption failed — continue with original downloaded file
      }
    }

    // 3) Extract zip
    currentJob.progress = 50;
    const extractDir = path.join(downloadPath, 'extracted');
    if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });
    await fs.createReadStream(workingZip).pipe(unzipper.Extract({ path: extractDir })).promise();

    // 4) Find .archive file inside extracted folder
    let archiveFile = null;
    const findArchive = async (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          await findArchive(p);
          if (archiveFile) return;
        } else if (e.isFile() && e.name.endsWith('.archive')) {
          archiveFile = p; return;
        }
      }
    };
    await findArchive(extractDir);
    if (!archiveFile && workingZip.endsWith('.archive')) archiveFile = workingZip;

    if (!archiveFile) {
      job.status = 'failed';
      job.error = 'No mongodump archive found in backup';
      job.finishedAt = new Date();
      await job.save();
      currentJob = { id: job._id, status: 'failed', error: job.error };
      throw new Error('No mongodump archive found in backup');
    }

    // 5) Ensure mongorestore available
    const mongorestoreCmd = process.env.MONGORESTORE_PATH || 'mongorestore';
    try {
      await execa(mongorestoreCmd, ['--version']);
    } catch (e) {
      job.status = 'failed'; job.error = 'mongorestore not found in PATH'; job.finishedAt = new Date(); await job.save(); currentJob = { id: job._id, status: 'failed', error: job.error }; throw new Error('mongorestore not found in PATH');
    }

    // 6) Run mongorestore into targetDb using nsFrom->nsTo mapping
    currentJob.progress = 70;
    // For mongorestore we prefer a server-only URI (no database path) so nsFrom/nsTo mappings work correctly.
    const mongoUri = process.env.MONGO_RESTORE_URI || (() => {
      const envUri = process.env.MONGO_URI || '';
      if (!envUri) return 'mongodb://localhost:27017';
      const m = envUri.match(/^(mongodb(?:\+srv)?:\/\/[^\/]+)(?:\/.*)?$/i);
      return m ? m[1] : envUri;
    })();
      const nsFrom = 'tourdb.*';
      const nsTo = `${targetDb}.*`;
    await execa(mongorestoreCmd, [`--archive=${archiveFile}`, '--gzip', `--nsFrom=${nsFrom}`, `--nsTo=${nsTo}`, `--uri=${mongoUri}`], { stdio: 'inherit' });

    currentJob.progress = 95;
    job.status = 'completed';
    job.finishedAt = new Date();
    await job.save();
    currentJob = { id: job._id, status: 'completed', progress: 100 };

    // cleanup
    try { fs.rmSync(downloadPath, { recursive: true, force: true }); } catch (e) {}
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
