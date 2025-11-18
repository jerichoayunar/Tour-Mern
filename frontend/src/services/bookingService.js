// src/services/bookingService.js - CORRECTED
import api from './api';

// ADMIN: Get all bookings
export const getBookings = async (filters = {}) => {
  try {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ADMIN: Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Get current user's bookings
export const getMyBookings = async () => {
  try {
    const response = await api.get('/bookings/mybookings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Create new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Get single booking
export const getBooking = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Delete booking
export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  // Admin functions
  getBookings,
  updateBookingStatus,
  // User functions
  getMyBookings,
  createBooking,
  getBooking,
  deleteBooking
};