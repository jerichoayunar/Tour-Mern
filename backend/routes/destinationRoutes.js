// backend/routes/destinationRoutes.js
import express from 'express';
import {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination
} from '../controllers/destinationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { 
  createDestinationSchema, 
  updateDestinationSchema 
} from '../validations/destinationValidation.js';
import { uploadSingleImage } from '../utils/multerConfig.js';

const router = express.Router();

// Public routes
router.get('/', getDestinations);
router.get('/:id', getDestination);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

// Add image upload middleware to create and update routes
router.post(
  '/', 
  uploadSingleImage('image'), // Handle single image upload
  validateRequest(createDestinationSchema), 
  createDestination
);

router.put(
  '/:id', 
  uploadSingleImage('image'), // Optional image update
  validateRequest(updateDestinationSchema), 
  updateDestination
);

router.delete('/:id', deleteDestination);

export { router as destinationRoutes };