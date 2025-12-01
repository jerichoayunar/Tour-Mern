// backend/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';

// Load multer-storage-cloudinary robustly (handles CJS/ESM)
const require = createRequire(import.meta.url);
let pkg;
try {
  pkg = require('multer-storage-cloudinary');
} catch (err) {
  // If package isn't installed, rethrow with clearer message
  throw new Error('multer-storage-cloudinary is required but not installed. Run `npm install multer-storage-cloudinary`.');
}

const CloudinaryStorage = pkg.CloudinaryStorage || pkg.default || pkg;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage for Cloudinary
let storageInstance;
const storageOptions = {
  cloudinary: cloudinary,
  params: {
    folder: 'tour-mern/destinations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto' }
    ]
  },
};

if (typeof CloudinaryStorage === 'function') {
  try {
    // Some versions export a constructor
    storageInstance = new CloudinaryStorage(storageOptions);
  } catch (err) {
    // Some packages export a factory function that returns the storage directly
    storageInstance = CloudinaryStorage(storageOptions);
  }
} else if (typeof pkg === 'function') {
  // pkg itself might be a factory
  storageInstance = pkg(storageOptions);
} else {
  throw new Error('Unsupported export from multer-storage-cloudinary');
}

export const storage = storageInstance;

export { cloudinary };