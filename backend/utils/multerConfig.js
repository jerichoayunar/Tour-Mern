import multer from 'multer';
import ApiError from './ApiError.js';

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed!'), false);
  }
};

// Create multer instance
export const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage for Cloudinary
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Helper to handle single file upload
export const uploadSingleImage = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return next(new ApiError(400, err.message));
      }
      next();
    });
  };
};