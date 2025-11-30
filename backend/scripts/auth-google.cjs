#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { google } = require('googleapis');

const BACKEND_DIR = path.resolve(__dirname, '..');
const TOKEN_PATHS = [
  path.join(BACKEND_DIR, '.gdrive_token.json'), // where backend expects it
  path.join(process.cwd(), '.gdrive_token.json') // also write to CWD if different
];
const CONFIG_PATH = path.join(BACKEND_DIR, '.gdrive_config.json');

function getOAuthClient() {
  // Support Drive-specific env vars while keeping backwards compatibility
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirect = process.env.GOOGLE_DRIVE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_CALLBACK_URL;
  if (!clientId || !clientSecret || !redirect) {
    console.error('Missing GOOGLE_DRIVE_CLIENT_ID/GOOGLE_DRIVE_CLIENT_SECRET/GOOGLE_DRIVE_REDIRECT_URI (or fallback GOOGLE_CLIENT_ID/SECRET/REDIRECT) in backend/.env');
    process.exit(2);
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirect);
}

function openUrlInBrowser(url) {
  const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.warn('Could not open browser automatically:', err.message);
  });
}

function saveTokens(tokens) {
  for (const p of TOKEN_PATHS) {
    try {
      fs.writeFileSync(p, JSON.stringify(tokens, null, 2));
      console.log('Saved tokens to', p);
    } catch (err) {
      console.warn('Failed to save tokens to', p, err.message);
    }
  }
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
    console.log('Saved gdrive config to', CONFIG_PATH);
  } catch (err) {
    console.warn('Failed to save config', err.message);
  }
}

async function run() {
  const oauth2Client = getOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });

  console.log('\nOpen this URL in your browser to authorize Google Drive access:\n');
  console.log(url, '\n');
  openUrlInBrowser(url);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('After approving, paste the full redirect URL here (or just the `code=` value):\n', async (answer) => {
    rl.close();
    const m = answer.match(/[?&]code=([^&]+)/);
    const code = m ? decodeURIComponent(m[1]) : answer.trim();
    if (!code) {
      console.error('No code provided. Exiting.');
      process.exit(3);
    }
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      saveTokens(tokens);
      // Save a minimal config (folder id if provided in env)
      const cfg = {};
      if (process.env.BACKUP_FOLDER_ID) cfg.backupFolderId = process.env.BACKUP_FOLDER_ID;
      saveConfig(cfg);
      console.log('\nGoogle Drive authorization complete. Tokens saved.');
      process.exit(0);
    } catch (err) {
      console.error('Failed to exchange code for tokens:', err.message);
      process.exit(4);
    }
  });
}

run();
