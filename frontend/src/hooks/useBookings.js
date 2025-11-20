// src/hooks/useBookings.js - UPDATED WITH PERFORMANCE OPTIMIZATIONS
import { useState, useEffect, useContext, useCallback, useRef } from 'react'; // 🛠️ ADD: useCallback and useRef
import bookingService from '../services/bookingService';
import ToastContext from '../context/ToastContext';

export const useBookings = (initialFilters = {}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const { showToast } = useContext(ToastContext);
  
  // 🛠️ ADD: Abort controller ref for request cancellation
  const abortControllerRef = useRef(null);

  // ============================================================================
  // 🎯 REQUEST CLEANUP - PREVENT MEMORY LEAKS
  // ============================================================================
  useEffect(() => {
    return () => {
      // Cancel any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================================================
  // 🎯 FETCH BOOKINGS WITH FILTERS (ADMIN ONLY) - OPTIMIZED
  // ============================================================================
  const fetchBookings = useCallback(async (customFilters = null) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const currentFilters = customFilters || filters;
      console.log('🔄 Fetching bookings with filters:', currentFilters);
      
      const response = await bookingService.getBookings(currentFilters);
      
      // 🛠️ FIX: Check if request was cancelled before updating state
      if (!abortControllerRef.current.signal.aborted) {
        setBookings(response.data || []); // 🛠️ ADD: Fallback to empty array
        console.log('✅ Bookings fetched successfully:', response.data?.length || 0);
      }
    } catch (err) {
      // 🛠️ FIX: Don't show errors for cancelled requests
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        console.log('ℹ️ Request cancelled');
        return;
      }
      
      const errorMessage = err.message || 'Failed to fetch bookings';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setBookings([]); // 🛠️ ADD: Clear bookings on error
      
      console.error('❌ Fetch bookings error:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [filters, showToast]); // 🛠️ FIX: Proper dependencies

  // ============================================================================
  // 🎯 FETCH CURRENT USER'S BOOKINGS - OPTIMIZED
  // ============================================================================
  const fetchMyBookings = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching user bookings');
      const response = await bookingService.getMyBookings();
      
      if (!abortControllerRef.current.signal.aborted) {
        setBookings(response.data || []);
        console.log('✅ User bookings fetched:', response.data?.length || 0);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        return;
      }
      
      const errorMessage = err.message || 'Failed to fetch your bookings';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setBookings([]);
      
      console.error('❌ Fetch user bookings error:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [showToast]); // 🛠️ FIX: Only depend on showToast

  // ============================================================================
  // 🎯 FETCH SINGLE BOOKING - OPTIMIZED
  // ============================================================================
  const fetchBooking = useCallback(async (bookingId) => {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching booking:', bookingId);
      const response = await bookingService.getBooking(bookingId);
      console.log('✅ Booking fetched successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch booking';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('❌ Fetch booking error:', err);
      throw err; // 🛠️ IMPORTANT: Re-throw error for component handling
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ============================================================================
  // 🎯 CREATE NEW BOOKING - OPTIMIZED
  // ============================================================================
  const createBooking = useCallback(async (bookingData) => {
    if (!bookingData) {
      throw new Error('Booking data is required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Creating new booking');
      const response = await bookingService.createBooking(bookingData);
      showToast('Booking created successfully!', 'success');
      console.log('✅ Booking created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create booking';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('❌ Create booking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ============================================================================
  // 🎯 UPDATE BOOKING STATUS (ADMIN ONLY) - OPTIMIZED
  // ============================================================================
  const updateBookingStatus = useCallback(async (bookingId, status) => {
    if (!bookingId || !status) {
      throw new Error('Booking ID and status are required');
    }
    
    // 🛠️ ADD: Validate status against backend supported values
    const validStatuses = ['pending', 'confirmed', 'cancelled']; // Backend supports these
    if (!validStatuses.includes(status)) {
      const errorMsg = `Invalid status. Must be one of: ${validStatuses.join(', ')}`;
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Updating booking status:', { bookingId, status });
      const response = await bookingService.updateBookingStatus(bookingId, status);
      showToast(`Booking status updated to ${status}`, 'success');
      console.log('✅ Booking status updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update booking status';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('❌ Update booking status error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ============================================================================
  // 🎯 DELETE BOOKING - OPTIMIZED
  // ============================================================================
  const deleteBooking = useCallback(async (bookingId) => {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Deleting booking:', bookingId);
      await bookingService.deleteBooking(bookingId);
      showToast('Booking deleted successfully!', 'success');
      console.log('✅ Booking deleted successfully');
      
      // 🛠️ OPTIMIZATION: Refresh current view without full reload
      // This could be optimized further by removing the deleted booking from state
      // instead of refetching all data
      await fetchMyBookings();
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete booking';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('❌ Delete booking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast, fetchMyBookings]); // 🛠️ FIX: Add fetchMyBookings dependency

  // ============================================================================
  // 🎯 CANCEL BOOKING - OPTIMIZED
  // ============================================================================
  const cancelBooking = useCallback(async (bookingId) => {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cancelling booking:', bookingId);
      await bookingService.cancelBooking(bookingId);
      showToast('Booking cancelled successfully!', 'success');
      console.log('✅ Booking cancelled successfully');
      
      await fetchMyBookings();
    } catch (err) {
      const errorMessage = err.message || 'Failed to cancel booking';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('❌ Cancel booking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast, fetchMyBookings]);

  // ============================================================================
  // 🎯 FILTER MANAGEMENT - OPTIMIZED
  // ============================================================================
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]); // 🛠️ FIX: Add initialFilters dependency

  // ============================================================================
  // 🎯 RETURN HOOK API
  // ============================================================================
  return {
    // State
    bookings,
    loading,
    error,
    filters,
    
    // Actions
    fetchBookings,
    fetchMyBookings,
    fetchBooking,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    cancelBooking, // Export new function
    updateFilters,
    clearFilters,
    
    // 🛠️ ADD: Utility function to cancel pending requests
    cancelRequests: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  };
};