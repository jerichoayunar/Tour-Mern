// services/bookingService.js
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import ApiError from '../utils/ApiError.js';

// Get all bookings (admin)
export const getBookings = async (query) => {
  const { status, startDate, endDate, userId } = query;
  const filter = {};

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

// Create booking
export const createBooking = async (userId, data) => {
  const { packageId, clientName, clientEmail, clientPhone, bookingDate, guests, specialRequests } = data;

  if (!packageId || !clientName || !clientEmail || !clientPhone || !bookingDate || !guests)
    throw new ApiError(400, 'All fields are required');

  const tourPackage = await Package.findById(packageId);
  if (!tourPackage) throw new ApiError(404, 'Package not found');

  const totalPrice = tourPackage.price * Number(guests);

  const booking = await Booking.create({
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

  return await Booking.findById(booking._id).populate('package', 'title price');
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
