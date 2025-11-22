// services/bookingService.js
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import ApiError from '../utils/ApiError.js';

// Helper: Detect whether the connected MongoDB deployment supports transactions
const supportsTransactions = async () => {
  try {
    const admin = mongoose.connection.db.admin();
    // 'hello' is preferred; fall back to 'ismaster' for older servers
    let info;
    try {
      info = await admin.command({ hello: 1 });
    } catch (e) {
      info = await admin.command({ ismaster: 1 });
    }

    // logicalSessionTimeoutMinutes is present when sessions are supported
    const hasLogicalSession = info && info.logicalSessionTimeoutMinutes != null;
    // Replica set presence or mongos also indicates support for transactions
    const isReplicaSet = !!(info && (info.setName || info.msg === 'isdbgrid'));

    return hasLogicalSession && isReplicaSet;
  } catch (err) {
    console.warn('Could not determine MongoDB transaction support:', err.message);
    return false;
  }
};
// Get all bookings (admin)
export const getBookings = async (query) => {
  const { status, startDate, endDate, userId, onlyArchived, includeArchived } = query;
  const filter = {};

  // Archive filtering logic
  if (onlyArchived === 'true') {
    filter.archived = true;
  } else if (includeArchived !== 'true') {
    filter.$or = [
      { archived: false },
      { archived: { $exists: false } }
    ];
  }

  if (status) filter.status = status;
  if (userId) filter.user = userId; // Filter by specific user
  if (startDate || endDate) {
    filter.bookingDate = {};
    if (startDate) filter.bookingDate.$gte = new Date(startDate);
    if (endDate) filter.bookingDate.$lte = new Date(endDate);
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('package', 'title price destination duration image')
    .sort({ bookingDate: -1 });

  return bookings;
};

// Get user’s own bookings
export const getMyBookings = async (userId) => {
  return await Booking.find({ user: userId })
    .populate('package', 'title price image duration')
    .sort({ createdAt: -1 });
};

// Get single booking
export const getBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId)
    .populate('user', 'name email role')
    .populate('package', 'title price duration');

  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.user._id.toString() === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to view this booking');

  return booking;
};

// Get refund estimate without modifying booking (used by frontend before cancellation)
export const getRefundEstimate = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId).populate('package', 'title price');
  if (!booking) throw new ApiError(404, 'Booking not found');

  // Authorization: owner or admin
  const isOwner = booking.user.toString() === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to view this booking');

  const now = new Date();
  const tourDate = new Date(booking.bookingDate);
  const daysUntil = Math.ceil((tourDate - now) / (1000 * 60 * 60 * 24));

  let refundAmount = 0;
  let refundPercentage = 0;
  const total = booking.totalPrice || booking.totalAmount || 0;

  if (daysUntil >= 14) {
    refundAmount = total;
    refundPercentage = 100;
  } else if (daysUntil >= 7) {
    refundAmount = Math.floor(total * 0.5);
    refundPercentage = 50;
  } else {
    refundAmount = 0;
    refundPercentage = 0;
  }

  return {
    refundAmount,
    refundPercentage,
    daysUntil,
    total,
    bookingId: booking._id,
    packageTitle: booking.package?.title || null,
    bookingDate: booking.bookingDate
  };
};

// Create booking
export const createBooking = async (userId, data) => {
  const { packageId, clientName, clientEmail, clientPhone, bookingDate, guests, specialRequests } = data;

  if (!packageId || !clientName || !clientEmail || !clientPhone || !bookingDate || !guests)
    throw new ApiError(400, 'All fields are required');
  let session;
  let useTransaction = false;

  try {
    // Check whether the current deployment supports transactions
    useTransaction = await supportsTransactions();

    if (useTransaction) {
      session = await mongoose.startSession();
      try {
        session.startTransaction();
      } catch (startErr) {
        // If starting a transaction fails, disable transactional flow
        console.warn('Failed to start transaction; falling back to non-transactional create:', startErr.message);
        useTransaction = false;
      }
    } else {
      console.info('MongoDB does not support transactions in this environment; using non-transactional booking create.');
    }

    // Fetch package (use session only if transactions are enabled)
    const tourPackage = useTransaction && session
      ? await Package.findById(packageId).session(session)
      : await Package.findById(packageId);

    if (!tourPackage) {
      if (useTransaction && session) await session.abortTransaction();
      throw new ApiError(404, 'Package not found');
    }

    const totalPrice = tourPackage.price * Number(guests);

    let booking;
    if (useTransaction && session) {
      booking = await Booking.create([
        {
          user: userId,
          package: packageId,
          clientName,
          clientEmail,
          clientPhone,
          bookingDate: new Date(bookingDate),
          guests: Number(guests),
          totalPrice,
          specialRequests: specialRequests || '',
        }
      ], { session });

      // Only commit if a transaction was actually started
      try {
        if (session.inTransaction && session.inTransaction()) {
          await session.commitTransaction();
        }
      } catch (commitErr) {
        console.error('Error committing transaction, aborting and falling back:', commitErr.message);
        try {
          if (session.inTransaction && session.inTransaction()) await session.abortTransaction();
        } catch (e) {
          console.error('Failed to abort transaction after commit failure:', e.message);
        }
        throw commitErr;
      }

      // Return populated booking
      return await Booking.findById(booking[0]._id).populate('package', 'title price');
    }

    // Non-transactional create (fallback)
    const created = await Booking.create({
      user: userId,
      package: packageId,
      clientName,
      clientEmail,
      clientPhone,
      bookingDate: new Date(bookingDate),
      guests: Number(guests),
      totalPrice,
      specialRequests: specialRequests || '',
    });

    return await Booking.findById(created._id).populate('package', 'title price');
  } catch (error) {
    // If a transaction was started, attempt to abort it
    try {
      if (session && useTransaction) await session.abortTransaction();
    } catch (abortErr) {
      console.error('Failed to abort transaction after error:', abortErr.message);
    }
    throw error;
  } finally {
    if (session) session.endSession();
  }
};

export const updateAdminNotes = async (bookingId, notes) => {
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { adminNotes: notes },
    { new: true }
  );
  if (!booking) {
    const ApiError = require('../utils/ApiError');
    throw new ApiError(404, 'Booking not found');
  }
  return booking;
};

// Update booking status (admin)
export const updateBookingStatus = async (bookingId, status) => {
  if (!['pending', 'confirmed', 'cancelled'].includes(status))
    throw new ApiError(400, 'Invalid status value');

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true, runValidators: true }
  )
    .populate('user', 'name email')
    .populate('package', 'title price');

  if (!booking) throw new ApiError(404, 'Booking not found');

  return booking;
};

// Delete booking (with refund calculation)
export const deleteBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId)
    .populate('package', 'title price');
    
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.user.toString() === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to delete this booking');

  // Calculate refund before deleting
  const now = new Date();
  const tourDate = new Date(booking.bookingDate);
  const daysUntil = Math.ceil((tourDate - now) / (1000 * 60 * 60 * 24));

  let refundAmount = 0;
  let refundPercentage = 0;
  
  if (daysUntil >= 14) {
    refundAmount = booking.totalPrice;
    refundPercentage = 100;
  } else if (daysUntil >= 7) {
    refundAmount = Math.floor(booking.totalPrice * 0.5);
    refundPercentage = 50;
  }

  // Store cancellation info before deletion
  const bookingData = {
    _id: booking._id,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone,
    bookingDate: booking.bookingDate,
    guests: booking.guests,
    totalPrice: booking.totalPrice,
    package: booking.package,
    destinationName: booking.package?.title,
    cancellation: {
      cancelledAt: now,
      cancelledBy: isAdmin ? 'admin' : 'user',
      refundAmount,
      refundPercentage,
      refundStatus: 'pending'
    }
  };

  await booking.deleteOne();
  
  return bookingData;
};

// ============================================================================
// 🔹 CANCEL BOOKING WITH REFUND CALCULATION (7/14/0 policy)
// ============================================================================
export const cancelBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId)
    .populate('user', 'name email')
    .populate('package', 'title price');

  if (!booking) throw new ApiError(404, 'Booking not found');

  // Authorization: only owner or admin
  const isOwner = booking.user._id.toString() === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to cancel this booking');

  // Cannot cancel already cancelled or confirmed bookings
  if (booking.status === 'cancelled') throw new ApiError(400, 'Booking is already cancelled');
  if (booking.status === 'confirmed') throw new ApiError(400, 'Cannot cancel a confirmed booking. Contact admin.');

  // Calculate days until tour
  const now = new Date();
  const tourDate = new Date(booking.bookingDate);
  const daysUntil = Math.ceil((tourDate - now) / (1000 * 60 * 60 * 24));

  // Apply refund policy
  let refundAmount = 0;
  if (daysUntil >= 14) {
    refundAmount = booking.totalPrice; // 100% refund
  } else if (daysUntil >= 7) {
    refundAmount = Math.floor(booking.totalPrice * 0.5); // 50% refund
  }
  // else: 0% refund (no refund)

  // Update booking with cancellation info
  booking.status = 'cancelled';
  booking.cancellation = {
    cancelledAt: now,
    cancelledBy: isAdmin ? 'admin' : 'user',
    reason: isAdmin ? 'Admin cancelled' : 'User requested cancellation',
    refundAmount,
    refundStatus: 'pending',
    refundProcessedAt: null
  };

  await booking.save();

  return booking;
};

// ============================================================================
// 🔹 ADMIN: PROCESS REFUND (Mark refund as processed)
// ============================================================================
export const processRefund = async (bookingId, processed) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) throw new ApiError(404, 'Booking not found');
  if (!booking.cancellation) throw new ApiError(400, 'This booking is not cancelled');

  booking.cancellation.refundStatus = processed ? 'processed' : 'rejected';
  booking.cancellation.refundProcessedAt = new Date();

  await booking.save();

  return booking;
};

// ============================================================================
// 🔹 ARCHIVE SYSTEM (Soft Delete)
// ============================================================================

// Archive booking
export const archiveBooking = async (bookingId, adminId, reason = null) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.archived) {
    throw new ApiError(400, 'Booking is already archived');
  }

  const archivedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      $set: {
        archived: true,
        archivedAt: new Date(),
        archivedBy: adminId,
        archivedReason: reason
      }
    },
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  return archivedBooking;
};

// Restore archived booking
export const restoreBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (!booking.archived) {
    throw new ApiError(400, 'Booking is not archived');
  }

  const restoredBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      $set: {
        archived: false,
        archivedAt: null,
        archivedBy: null,
        archivedReason: null
      }
    },
    { new: true, runValidators: true }
  );

  return restoredBooking;
};

// Permanently delete booking (only for archived bookings)
export const permanentDeleteBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (!booking.archived) {
    throw new ApiError(400, 'Booking must be archived before permanent deletion');
  }

  await Booking.findByIdAndDelete(bookingId);
};
