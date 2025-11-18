import express from 'express';
import {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage
} from '../controllers/packageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { 
  createPackageSchema, 
  updatePackageSchema 
} from '../validations/packageValidation.js';
import { uploadSingleImage } from '../utils/multerConfig.js'; // ADD THIS IMPORT

const router = express.Router();

// Public routes
router.get('/', getPackages);
router.get('/:id', getPackage);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

// UPDATE: Add uploadSingleImage middleware to create and update routes
router.post(
  '/', 
  uploadSingleImage('image'), // ADD THIS MIDDLEWARE
  validateRequest(createPackageSchema), 
  createPackage
);

router.put(
  '/:id', 
  uploadSingleImage('image'), // ADD THIS MIDDLEWARE
  validateRequest(updatePackageSchema), 
  updatePackage
);

router.delete('/:id', deletePackage);

export { router as packageRoutes };