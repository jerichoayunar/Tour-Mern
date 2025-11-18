// controllers/bookingController.js
import * as bookingService from '../services/bookingService.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js'; // ✅ ADD: For activity tracking

// @desc Get all bookings (Admin only)
// @route GET /api/bookings
// @access Private/Admin
export const getBookings = async (req, res, next) => {
  try {
    // Call service layer to get all bookings with optional query filters
    const bookings = await bookingService.getBookings(req.query);
    
    // Return success response with bookings data and count
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    // Pass error to global error handler middleware
    next(error);
  }
};

// @desc Get current user's bookings
// @route GET /api/bookings/mybookings
// @access Private
export const getMyBookings = async (req, res, next) => {
  try {
    // Call service layer to get bookings for currently authenticated user only
    const bookings = await bookingService.getMyBookings(req.user.id);
    
    // Return success response with user's bookings
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    // Pass error to global error handler middleware
    next(error);
  }
};

// @desc Get single booking
// @route GET /api/bookings/:id
// @access Private
export const getBooking = async (req, res, next) => {
  try {
    // Call service layer to get specific booking by ID with authorization check
    const booking = await bookingService.getBooking(req.params.id, req.user);
    
    // Return success response with single booking data
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    // Pass error to global error handler middleware
    next(error);
  }
};

// @desc Create new booking
// @route POST /api/bookings
// @access Private
export const createBooking = async (req, res, next) => {
  try {
    // Call service layer to create new booking with user ID and booking data
    const booking = await bookingService.createBooking(req.user.id, req.body);
    
    // ✅ ADD: ACTIVITY LOGGING - Track new bookings
    // Why here? Business critical - track revenue and user activity
    try {
      await logActivity({
        userId: req.user.id,
        type: 'booking_created',
        description: `Booking created for ${booking.destinationName || 'destination'}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { 
          bookingId: booking._id || booking.id,
          destination: booking.destinationName,
          amount: booking.totalAmount,
          bookingDate: booking.bookingDate,
          status: booking.status,
          guests: booking.guests || 1
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed for booking creation:', activityError.message);
    }

    // Return 201 Created status with success message and booking data
    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      data: booking,
    });
  } catch (error) {
    // Pass error to global error handler middleware
    next(error);
  }
};

// @desc Update booking status (Admin only)
// @route PUT /api/bookings/:id/status
// @access Private/Admin
export const updateBookingStatus = async (req, res, next) => {
  try {
    // Call service layer to update booking status (admin only operation)
    const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status);
    
    // ✅ ADD: ACTIVITY LOGGING - Track status changes (Admin action)
    // Why here? Track admin operations and booking lifecycle
    try {
      await logActivity({
        userId: req.user.id, // This is the ADMIN user ID
        type: 'booking_status_updated',
        description: `Admin updated booking status to ${req.body.status}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { 
          bookingId: req.params.id,
          oldStatus: booking.previousStatus, // If your service returns this
          newStatus: req.body.status,
          adminId: req.user.id,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed for booking status update:', activityError.message);
    }

    // Return success response with updated booking and status message
    res.status(200).json({
      success: true,
      message: `Booking status updated to ${req.body.status}`,
      data: booking,
    });
  } catch (error) {
    // Pass error to global error handler middleware
    next(error);
  }
};

// @desc Delete booking
// @route DELETE /api/bookings/:id
// @access Private
export const deleteBooking = async (req, res, next) => {
  try {
    // Call service layer to delete booking with authorization check
    const deletedBooking = await bookingService.deleteBooking(req.params.id, req.user);
    
    // ✅ ADD: ACTIVITY LOGGING - Track booking cancellations
    // Why here? Important for business analytics and user behavior
    try {
      await logActivity({
        userId: req.user.id,
        type: 'booking_cancelled',
        description: `Booking cancelled for ${deletedBooking.destinationName || 'destination'}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { 
          bookingId: req.params.id,
          destination: deletedBooking.destinationName,
          originalAmount: deletedBooking.totalAmount,
          cancellationDate: new Date().toISOString()
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed for booking cancellation:', activityError.message);
    }

    // Return success response with confirmation message (no data returned for DELETE)
    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully!',
    });
  } catch (error) {
    // Pass error to global error handler middleware
    next(error);
  }
};