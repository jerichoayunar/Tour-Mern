// src/services/bookingService.js - CORRECTED
import api from './api';

const normalizeResponse = (response) => {
  const payload = response?.data || {};
  return {
    success: payload.success,
    data: payload.data ?? payload,
    message: payload.message,
    token: payload.data?.token ?? payload.token
  };
};

// ADMIN: Get all bookings
export const getBookings = async (filters = {}) => {
  try {
    const response = await api.get('/bookings', { params: filters });
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ADMIN: Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, { status });
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Get current user's bookings
export const getMyBookings = async () => {
  try {
    const response = await api.get('/bookings/mybookings');
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Create new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Get single booking
export const getBooking = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Delete booking
export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get refund estimate (server-provided)
export const getRefundEstimate = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}/refund-estimate`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ADMIN: Save internal admin notes for a booking
export const saveAdminNotes = async (bookingId, notes) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/notes`, { notes });
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ADMIN: Resend booking confirmation email
export const resendConfirmation = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/resend-confirmation`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ADMIN: Archive booking
export const archiveBooking = async (bookingId, reason) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/archive`, { reason });
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ADMIN: Restore booking
export const restoreBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/restore`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ADMIN: Permanently delete booking
export const deleteBookingPermanent = async (bookingId) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}/permanent`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  // Admin functions
  getBookings,
  updateBookingStatus,
  archiveBooking,
  restoreBooking,
  deleteBookingPermanent,
  // User functions
  getMyBookings,
  createBooking,
  getBooking,
  deleteBooking,
  cancelBooking, // Export new function
  // Extras
  getRefundEstimate,
  saveAdminNotes,
  resendConfirmation
};