// services/bookingService.js
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import ApiError from '../utils/ApiError.js';

// Get all bookings (admin)
export const getBookings = async (query) => {
  const { status, startDate, endDate } = query;
  const filter = {};

  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.bookingDate = {};
    if (startDate) filter.bookingDate.$gte = new Date(startDate);
    if (endDate) filter.bookingDate.$lte = new Date(endDate);
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('package', 'title price')
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

// Delete booking
export const deleteBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.user.toString() === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to delete this booking');

  await booking.deleteOne();
};
