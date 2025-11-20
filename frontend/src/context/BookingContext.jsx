// src/context/BookingContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useBookings } from '../hooks/useBookings';

const BookingContext = createContext();

// Action types
const BOOKING_ACTIONS = {
  SET_BOOKINGS: 'SET_BOOKINGS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_BOOKING: 'ADD_BOOKING',
  UPDATE_BOOKING: 'UPDATE_BOOKING',
  DELETE_BOOKING: 'DELETE_BOOKING',
  CLEAR_BOOKINGS: 'CLEAR_BOOKINGS',
};

// Reducer function
const bookingReducer = (state, action) => {
  switch (action.type) {
    case BOOKING_ACTIONS.SET_BOOKINGS:
      return {
        ...state,
        bookings: action.payload,
        loading: false,
        error: null,
      };
    case BOOKING_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case BOOKING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case BOOKING_ACTIONS.ADD_BOOKING:
      return {
        ...state,
        bookings: [action.payload, ...state.bookings],
      };
    case BOOKING_ACTIONS.UPDATE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        ),
      };
    case BOOKING_ACTIONS.DELETE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking._id !== action.payload),
      };
    case BOOKING_ACTIONS.CLEAR_BOOKINGS:
      return {
        ...state,
        bookings: [],
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  bookings: [],
  loading: false,
  error: null,
};

export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { user } = useAuth();
  const {
    bookings,
    loading,
    error,
    fetchMyBookings,
    addBooking,
    updateStatus,
    removeBooking,
    clearError,
  } = useBookings();

  // Load user's bookings when user changes
  useEffect(() => {
    if (user) {
      loadUserBookings();
    } else {
      dispatch({ type: BOOKING_ACTIONS.CLEAR_BOOKINGS });
    }
  }, [user]);

  const loadUserBookings = async () => {
    dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
    try {
      await fetchMyBookings();
      dispatch({ type: BOOKING_ACTIONS.SET_BOOKINGS, payload: bookings });
    } catch (err) {
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: err.message });
    }
  };

  const createNewBooking = async (bookingData) => {
    dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await addBooking(bookingData);
      dispatch({ type: BOOKING_ACTIONS.ADD_BOOKING, payload: response.data });
      return response;
    } catch (err) {
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: err.message });
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await updateStatus(bookingId, status);
      dispatch({ type: BOOKING_ACTIONS.UPDATE_BOOKING, payload: response.data });
      return response;
    } catch (err) {
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: err.message });
      throw err;
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      await removeBooking(bookingId);
      dispatch({ type: BOOKING_ACTIONS.DELETE_BOOKING, payload: bookingId });
    } catch (err) {
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: err.message });
      throw err;
    }
  };

  const clearBookingError = () => {
    dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: null });
  };

  const value = useMemo(() => ({
    bookings: state.bookings,
    loading: state.loading,
    error: state.error,
    createNewBooking,
    updateBookingStatus,
    deleteBooking,
    loadUserBookings,
    clearBookingError,
  }), [state.bookings, state.loading, state.error]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};