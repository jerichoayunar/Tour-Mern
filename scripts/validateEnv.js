#!/usr/bin/env node

/**
 * Environment Variables Validator
 * ==============================
 * 
 * Purpose: Check if backend and frontend .env files have all required keys
 * Usage: node scripts/validateEnv.js
 * 
 * This script:
 * 1. Reads backend/.env and frontend/.env
 * 2. Checks each required key exists
 * 3. Reports missing/empty values
 * 4. Gives you a checklist to fix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Define required environment variables
const BACKEND_REQUIRED = {
  'MONGO_URI': '🗄️ MongoDB connection string (e.g., mongodb://localhost:27017/tourdb)',
  'JWT_SECRET': '🔐 Secret key for JWT tokens (any long random string)',
  'PORT': '🔌 Server port (default: 5000)',
  'GOOGLE_CLIENT_ID': '🔑 Google OAuth Client ID (from Google Cloud Console)',
  'GOOGLE_CLIENT_SECRET': '🔑 Google OAuth Secret (from Google Cloud Console)',
  'GOOGLE_CALLBACK_URL': '🌐 Google OAuth callback URL (e.g., http://localhost:5000/api/auth/google/callback)',
  'CLOUDINARY_CLOUD_NAME': '☁️ Cloudinary cloud name (from Cloudinary dashboard)',
  'CLOUDINARY_API_KEY': '☁️ Cloudinary API key',
  'CLOUDINARY_API_SECRET': '☁️ Cloudinary API secret',
  'EMAIL_USER': '📧 Email sender address (Gmail or your email service)',
  'EMAIL_PASSWORD': '📧 Email password or app-specific password',
  'EMAIL_SERVICE': '📧 Email service provider (e.g., gmail)',
  'RECAPTCHA_SECRET_KEY': '🤖 reCAPTCHA secret key (from reCAPTCHA admin console)',
  'FRONTEND_URL': '🌐 Frontend URL (e.g., http://localhost:5173)',
};

const FRONTEND_REQUIRED = {
  'VITE_API_URL': '🔗 Backend API URL (e.g., http://localhost:5000/api)',
  'VITE_RECAPTCHA_SITE_KEY': '🤖 reCAPTCHA site key (public key from console)',
};

/**
 * Parse a .env file and return key-value pairs
 */
function parseEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key) env[key.trim()] = value;
      }
    });
    return env;
  } catch (error) {
    return null;
  }
}

/**
 * Check environment variables for a given folder
 */
function checkEnv(folderName, requiredVars) {
  console.log(`\n📋 Checking ${folderName}/.env`);
  console.log('='.repeat(60));

  const envPath = path.join(repoRoot, folderName, '.env');
  const env = parseEnvFile(envPath);

  if (!env) {
    console.log(`❌ ${folderName}/.env NOT FOUND!`);
    console.log(`\n📝 Create ${folderName}/.env with these keys:`);
    Object.entries(requiredVars).forEach(([key, description]) => {
      console.log(`   ${key}=<your_value>  # ${description}`);
    });
    return false;
  }

  let allPresent = true;
  const missing = [];
  const empty = [];
  const present = [];

  Object.entries(requiredVars).forEach(([key, description]) => {
    if (!(key in env)) {
      missing.push(`   ❌ ${key} — NOT SET`);
      allPresent = false;
    } else if (!env[key] || env[key].trim() === '') {
      empty.push(`   ⚠️ ${key} — EMPTY VALUE`);
      allPresent = false;
    } else {
      // Show first 15 chars of value (masked for security)
      const valuePreview = env[key].length > 15 ? env[key].substring(0, 15) + '...' : env[key];
      present.push(`   ✅ ${key}=${valuePreview}`);
    }
  });

  if (present.length > 0) {
    console.log('\n✅ Present & set:');
    present.forEach(p => console.log(p));
  }

  if (missing.length > 0) {
    console.log('\n❌ Missing keys:');
    missing.forEach(m => console.log(m));
  }

  if (empty.length > 0) {
    console.log('\n⚠️ Empty values:');
    empty.forEach(e => console.log(e));
  }

  if (allPresent) {
    console.log(`\n✅ All required variables are set for ${folderName}!`);
  }

  return allPresent;
}

/**
 * Main validation flow
 */
function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   🔍 Environment Variables Validator - Tour MERN App      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const backendOk = checkEnv('backend', BACKEND_REQUIRED);
  const frontendOk = checkEnv('frontend', FRONTEND_REQUIRED);

  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));

  if (backendOk && frontendOk) {
    console.log('✅ All environment variables are properly configured!');
    console.log('\n🚀 You can now run:');
    console.log('   cd backend && npm run dev');
    console.log('   cd frontend && npm run dev');
  } else {
    console.log('⚠️ Some environment variables are missing or empty.');
    console.log('\n📝 Please fix the issues above and try again.');
    console.log('\n💡 Need help?');
    console.log('   - Check backend/.env.example for backend template');
    console.log('   - Check frontend/.env.example for frontend template');
    console.log('   - Ensure all Google OAuth, Cloudinary, and email keys are valid');
  }

  console.log('\n');

  // Exit with error code if any variables are missing
  process.exit(backendOk && frontendOk ? 0 : 1);
}

main();
