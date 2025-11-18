import express from 'express';
import {
  getBookings,
  getMyBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { createBookingSchema, updateStatusSchema } from '../validations/bookingValidation.js';

// Create Express router for booking routes
const router = express.Router();

// Apply authentication protection to ALL booking routes
// User must be logged in to access any booking endpoint
router.use(protect);

// ==================== USER ROUTES ====================
// These routes are accessible to all authenticated users

// GET /api/bookings/mybookings - Get current user's bookings
router.get('/mybookings', getMyBookings);

// POST /api/bookings - Create a new booking (with validation)
router.post('/', validateRequest(createBookingSchema), createBooking);

// GET /api/bookings/:id - Get a specific booking by ID
router.get('/:id', getBooking);

// DELETE /api/bookings/:id - Delete a booking (user can delete their own)
router.delete('/:id', deleteBooking);

// ==================== ADMIN ROUTES ====================
// These routes require admin privileges

// Apply admin authorization middleware to all following routes
router.use(authorize('admin'));

// GET /api/bookings - Get all bookings (admin only)
router.get('/', getBookings);

// PUT /api/bookings/:id/status - Update booking status (admin only with validation)
router.put('/:id/status', validateRequest(updateStatusSchema), updateBookingStatus);

// Export the router for use in main Express app
export { router as bookingRoutes };