// controllers/bookingController.js
import * as bookingService from '../services/bookingService.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js';
import emailService from '../services/emailService.js';

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
    
    // ✅ SEND BOOKING CONFIRMATION EMAIL
    try {
      await emailService.sendBookingConfirmation(booking);
    } catch (emailError) {
      console.log('Email sending failed (non-critical):', emailError.message);
      // Don't fail the booking creation if email fails
    }

    // ✅ ADD: ACTIVITY LOGGING - Track new bookings
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

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      data: booking,
    });
  } catch (error) {
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
    
    // ✅ SEND BOOKING STATUS UPDATE EMAIL
    try {
      await emailService.sendBookingStatusUpdate(booking, req.body.status);
    } catch (emailError) {
      console.log('Email sending failed (non-critical):', emailError.message);
    }

    // ✅ ADD: ACTIVITY LOGGING - Track status changes (Admin action)
    try {
      // Log activity for the ADMIN who performed the action
      await logActivity({
        userId: req.user.id, // Admin user ID
        type: 'booking_status_updated',
        description: `Admin updated booking status to ${req.body.status}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { 
          bookingId: req.params.id,
          oldStatus: booking.previousStatus,
          newStatus: req.body.status,
          adminId: req.user.id,
          affectedUserId: booking.user._id,
          updatedAt: new Date().toISOString()
        }
      });

      // Also log activity for the BOOKING OWNER so it shows in their activity tab
      await logActivity({
        userId: booking.user._id, // Booking owner's user ID
        type: 'booking_status_updated',
        description: `Your booking status was updated to ${req.body.status}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { 
          bookingId: req.params.id,
          oldStatus: booking.previousStatus,
          newStatus: req.body.status,
          updatedBy: 'admin',
          adminId: req.user.id,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed for booking status update:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${req.body.status}`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete booking
// @route DELETE /api/bookings/:id
// @access Private
export const deleteBooking = async (req, res, next) => {
  try {
    const deletedBooking = await bookingService.deleteBooking(req.params.id, req.user);
    
    // ✅ SEND BOOKING CANCELLATION EMAIL
    try {
      await emailService.sendBookingCancellation(deletedBooking);
    } catch (emailError) {
      console.log('Email sending failed (non-critical):', emailError.message);
      // Don't fail the deletion if email fails
    }

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
          refundAmount: deletedBooking.cancellation?.refundAmount || 0,
          refundPercentage: deletedBooking.cancellation?.refundPercentage || 0,
          cancellationDate: new Date().toISOString()
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed for booking cancellation:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 🎯 CANCEL BOOKING WITH REFUND (User or Admin initiated)
// ============================================================================
// @desc    Cancel booking with refund calculation
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user);

    try {
      await logActivity({
        userId: req.user.id,
        type: 'booking_cancelled',
        description: `Booking cancelled with refund: ₱${booking.cancellation.refundAmount}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          bookingId: req.params.id,
          refundAmount: booking.cancellation.refundAmount,
          refundStatus: booking.cancellation.refundStatus,
          cancelledBy: booking.cancellation.cancelledBy,
          daysBeforeTour: Math.ceil((booking.bookingDate - Date.now()) / (1000 * 60 * 60 * 24))
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: `Booking cancelled. Refund: ₱${booking.cancellation.refundAmount}`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 🎯 ADMIN: PROCESS REFUND
// ============================================================================
// @desc    Admin processes refund for cancelled booking
// @route   PUT /api/bookings/:id/refund
// @access  Private/Admin
export const processRefund = async (req, res, next) => {
  try {
    const { processed } = req.body;

    if (typeof processed !== 'boolean') {
      throw new ApiError(400, 'processed field must be true or false');
    }

    const booking = await bookingService.processRefund(req.params.id, processed);

    try {
      await logActivity({
        userId: req.user.id,
        type: 'refund_processed',
        description: `Admin ${processed ? 'approved' : 'rejected'} refund of ₱${booking.cancellation.refundAmount}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          bookingId: req.params.id,
          action: processed ? 'approved' : 'rejected',
          refundAmount: booking.cancellation.refundAmount
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: `Refund ${processed ? 'approved' : 'rejected'}`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 🔹 ARCHIVE SYSTEM
// ============================================================================

// @desc    Archive booking (soft delete)
// @route   PUT /api/bookings/:id/archive
// @access  Private/Admin
export const archiveBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await bookingService.archiveBooking(
      req.params.id,
      req.user._id,
      reason
    );

    try {
      await logActivity({
        userId: req.user.id,
        type: 'booking_archived',
        description: `Booking archived`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          bookingId: req.params.id,
          reason
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Booking archived successfully!',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore archived booking
// @route   PUT /api/bookings/:id/restore
// @access  Private/Admin
export const restoreBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.restoreBooking(req.params.id);

    try {
      await logActivity({
        userId: req.user.id,
        type: 'booking_restored',
        description: `Booking restored from archive`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          bookingId: req.params.id
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Booking restored successfully!',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete booking (archived only)
// @route   DELETE /api/bookings/:id/permanent
// @access  Private/Admin
export const permanentDeleteBooking = async (req, res, next) => {
  try {
    await bookingService.permanentDeleteBooking(req.params.id);

    try {
      await logActivity({
        userId: req.user.id,
        type: 'booking_deleted_permanent',
        description: `Booking permanently deleted`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          bookingId: req.params.id
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Booking permanently deleted!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get refund estimate for a booking (owner or admin)
// @route GET /api/bookings/:id/refund-estimate
// @access Private
export const getRefundEstimate = async (req, res, next) => {
  try {
    const estimate = await bookingService.getRefundEstimate(req.params.id, req.user);
    res.status(200).json({ success: true, data: estimate });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin notes on a booking (Admin only)
// @route   PUT /api/bookings/:id/notes
// @access  Private/Admin
export const updateAdminNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    if (typeof notes !== 'string') {
      return res.status(400).json({ success: false, message: 'Notes must be a string' });
    }

    const updated = await bookingService.updateAdminNotes(req.params.id, notes);

    try {
      await logActivity({
        userId: req.user.id,
        type: 'admin_updated_notes',
        description: `Admin updated notes for booking ${updated._id}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { bookingId: updated._id }
      });
    } catch (activityError) {
      console.log('Activity logging failed for admin notes update:', activityError.message);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend booking confirmation email (Admin only)
// @route   POST /api/bookings/:id/resend-confirmation
// @access  Private/Admin
export const resendBookingConfirmation = async (req, res, next) => {
  try {
    const booking = await bookingService.getBooking(req.params.id, req.user);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const sent = await emailService.sendBookingConfirmation(booking);

    try {
      await logActivity({
        userId: req.user.id,
        type: 'admin_resent_confirmation',
        description: `Admin resent booking confirmation for ${booking._id}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { bookingId: booking._id }
      });
    } catch (activityError) {
      console.log('Activity logging failed for resend confirmation:', activityError.message);
    }

    res.status(200).json({ success: !!sent, message: sent ? 'Confirmation resent' : 'Failed to send confirmation' });
  } catch (error) {
    next(error);
  }
};