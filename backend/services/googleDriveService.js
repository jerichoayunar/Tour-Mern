import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const TOKEN_PATH = path.join(process.cwd(), '.gdrive_token.json');
const CONFIG_PATH = path.join(process.cwd(), '.gdrive_config.json');

const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirect) {
    throw new Error('Google OAuth credentials are not configured in environment');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirect);
};

export const getAuthUrl = () => {
  const oauth2Client = getOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata'
  ];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });
};

const saveTokens = (tokens) => {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
};

const loadTokens = () => {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const raw = fs.readFileSync(TOKEN_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not load Google tokens', err.message);
  }
  return null;
};

const saveConfig = (cfg) => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  } catch (err) {
    console.warn('Could not save gdrive config', err.message);
  }
};

const loadConfig = () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (err) {
    console.warn('Could not load gdrive config', err.message);
  }
  return {};
};

export const setTokensFromCode = async (code) => {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  saveTokens(tokens);
  return tokens;
};

const getDriveClient = () => {
  const oauth2Client = getOAuthClient();
  const tokens = loadTokens();
  if (!tokens) throw new Error('No Google Drive tokens found; authorize first');
  oauth2Client.setCredentials(tokens);
  return google.drive({ version: 'v3', auth: oauth2Client });
};

export const ensureBackupFolder = async () => {
  const drive = getDriveClient();
  const envFolder = process.env.BACKUP_FOLDER_ID;
  if (envFolder && envFolder.trim()) return envFolder.trim();

  const cfg = loadConfig();
  if (cfg.backupFolderId) return cfg.backupFolderId;

  // Create folder named Tour-Mern Backups
  const res = await drive.files.create({
    requestBody: {
      name: 'Tour-MERN-Backups',
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id'
  });
  const folderId = res.data.id;
  cfg.backupFolderId = folderId;
  saveConfig(cfg);
  return folderId;
};

export const uploadFile = async (filePath, fileName, folderId) => {
  const drive = getDriveClient();
  const fileSize = fs.statSync(filePath).size;
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: folderId ? [folderId] : undefined
    },
    media: {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(filePath)
    },
    fields: 'id, size'
  });
  return { id: res.data.id, size: Number(res.data.size || fileSize) };
};

export const listBackupsInFolder = async (folderId, pageSize = 100) => {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    orderBy: 'createdTime desc',
    pageSize,
    fields: 'files(id,name,createdTime,size)'
  });
  return res.data.files || [];
};

export const deleteFile = async (fileId) => {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
};

export const deleteOldBackups = async (folderId, keep = 4) => {
  const files = await listBackupsInFolder(folderId, 1000);
  if (files.length <= keep) return files.length;
  const toDelete = files.slice(keep);
  for (const f of toDelete) {
    try {
      await deleteFile(f.id);
    } catch (err) {
      console.warn('Failed to delete backup file', f.id, err.message);
    }
  }
  return files.length - toDelete.length;
};

export const downloadFile = async (fileId, destPath) => {
  const drive = getDriveClient();
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  await new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(destPath);
    res.data
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .pipe(dest);
  });
};

export default {
  getAuthUrl,
  setTokensFromCode,
  ensureBackupFolder,
  uploadFile,
  listBackupsInFolder,
  deleteOldBackups,
  downloadFile
};
