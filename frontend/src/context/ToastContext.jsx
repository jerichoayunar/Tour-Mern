import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

/**
 * TOAST CONTEXT
 * 
 * WHAT THIS DOES:
 * - Manages global toast state for the entire app
 * - Provides functions to show different types of toasts
 * - Handles automatic toast removal
 * - Ensures consistent toast behavior across all components
 * 
 * USAGE:
 * const { showToast } = useToast();
 * showToast('Login successful!', 'success');
 */

const ToastContext = createContext();

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Show a new toast
   */
  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prevToasts => [...prevToasts, newToast]);

    // Return the toast id for potential manual removal
    return id;
  }, []);

  /**
   * Remove a specific toast
   */
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  /**
   * Convenience methods for different toast types
   */
  const toast = useMemo(() => ({
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    loading: (message, duration) => showToast(message, 'loading', duration)
  }), [showToast]);

  // Context value
  const value = {
    toasts,
    showToast,
    removeToast,
    toast // Convenience methods
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Custom hook to use toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;