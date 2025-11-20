// context/AuthContext.jsx - CLEAN PRODUCTION VERSION

/**
 * AUTHENTICATION CONTEXT
 * 
 * WHAT THIS DOES:
 * - Manages global authentication state for the entire app
 * - Provides user data, login, register, logout functions
 * - Handles Google OAuth authentication
 * - Persists user session across page refreshes
 * - Handles automatic token management
 * 
 * CONNECTED TO:
 * - authService.js (for API calls)
 * - All components that need user data (via useAuth hook)
 * - localStorage (for token persistence)
 * - ToastContext (for user notifications)
 */

import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

// Create Context for authentication
export const AuthContext = createContext();

// Provider Component - wraps entire app
export const AuthProvider = ({ children }) => {
  // State for user data, loading status, and errors
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Separate loading states for different operations
  const [operationLoading, setOperationLoading] = useState({
    login: false,
    register: false,
    google: false,
    logout: false
  });

  const { showToast } = useToast(); // Get toast functions

  /**
   * CHECK AUTH STATUS ON APP STARTUP
   * - Runs once when app loads
   * - Verifies if user has valid token
   * - Automatically logs in if token is valid
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const token = authService.getStoredToken();

      // No token = not logged in
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend and get user data
        const response = await authService.getMe();
        
        // If backend confirms valid token, set user data
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Token is invalid, clear it
        authService.clearLocalAuth();
        showToast('Session expired. Please sign in again.', 'info');
      } finally {
        // Always stop loading regardless of success/error
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [showToast]);

  /**
   * LOGIN USER
   * - Handles user login with email/password
   * - Stores token automatically on success
   * - Updates global user state
   */
  const login = async (credentials) => {
    try {
      setError(null);
      setOperationLoading(prev => ({ ...prev, login: true }));
      
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        setUser(response.data);
        showToast('Signed in successfully!', 'success');
        return { success: true, user: response.data };
      } else {
        setError(response.message);
        showToast(response.message || 'Login failed', 'error');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setOperationLoading(prev => ({ ...prev, login: false }));
    }
  };

  /**
   * REGISTER NEW USER
   * - Creates new user account
   * - Auto-logins after successful registration
   */
  const register = async (userData) => {
    try {
      setError(null);
      setOperationLoading(prev => ({ ...prev, register: true }));
      
      const response = await authService.register(userData);

      if (response.success) {
        const loginResult = await login({
          email: userData.email,
          password: userData.password,
          recaptchaToken: userData.recaptchaToken 
        });
        
        if (loginResult.success) {
          showToast(`Welcome to TourMERN, ${userData.name}!`, 'success');
        }
        return loginResult;
      } else {
        setError(response.message);
        showToast(response.message || 'Registration failed', 'error');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setOperationLoading(prev => ({ ...prev, register: false }));
    }
  };

  /**
   * GOOGLE OAUTH LOGIN
   * - Handles Google OAuth callback with token
   * - Verifies Google token with backend
   * - Sets user data on success
   */
  const googleLogin = async (googleToken) => {
    try {
      setError(null);
      setOperationLoading(prev => ({ ...prev, google: true }));
      
      const response = await authService.googleLogin(googleToken);

      if (response.success && response.data) {
        setUser(response.data);
        showToast('Google sign in successful! Welcome back!', 'success');
        return { success: true, user: response.data };
      } else {
        setError(response.message);
        showToast(response.message || 'Google sign in failed', 'error');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Google sign in failed';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setOperationLoading(prev => ({ ...prev, google: false }));
    }
  };

  /**
   * HANDLE GOOGLE OAUTH CALLBACK
   * - Processes the redirect from Google OAuth
   * - Extracts token from URL and completes login
   */
  const handleGoogleCallback = async () => {
    try {
      setOperationLoading(prev => ({ ...prev, google: true }));
      
      // Extract token from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userData = urlParams.get('user');

      if (token) {
        return await googleLogin(token);
      } else if (userData) {
        // Alternative: User data passed directly (for development)
        const user = JSON.parse(decodeURIComponent(userData));
        setUser(user);
        
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(user));
        if (user.token) {
          localStorage.setItem('token', user.token);
        }
        
        showToast('Google sign in successful!', 'success');
        return { success: true, user };
      } else {
        const errorMessage = 'No authentication data received from Google';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Failed to process Google sign in';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setOperationLoading(prev => ({ ...prev, google: false }));
    }
  };

  /**
   * INITIATE GOOGLE OAUTH FLOW
   * - Redirects user to Google OAuth
   * - Should be called when user clicks "Continue with Google"
   */
  const initiateGoogleLogin = () => {
    try {
      // Store current page to redirect back after login
      const currentPath = window.location.pathname;
      localStorage.setItem('preAuthPath', currentPath);
      
      // Redirect to backend Google OAuth endpoint
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      window.location.href = `${backendUrl}/api/auth/google`;
      
    } catch (error) {
      showToast('Failed to start Google sign in', 'error');
    }
  };

  /**
   * LOGOUT USER - CLEAN VERSION
   * - Calls backend logout endpoint to record activity
   * - Clears ALL local storage to prevent auto-login
   * - Returns to unauthenticated state
   */
  const logout = async () => {
    try {
      setOperationLoading(prev => ({ ...prev, logout: true }));
      
      // Call backend logout endpoint to record activity
      try {
        await authService.logout();
      } catch (backendError) {
        // Even if backend call fails, still clear frontend
        console.log('Backend logout call failed:', backendError.message);
      }
      
      // Clear ALL local storage to prevent auto-login
      authService.clearLocalAuth();
      
      // Clear React state
      setUser(null);
      setError(null);
      
      showToast('Signed out successfully', 'info');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even on error, force clear everything
      authService.clearLocalAuth();
      setUser(null);
      showToast('Signed out', 'info');
    } finally {
      setOperationLoading(prev => ({ ...prev, logout: false }));
    }
  };

  /**
   * CLEAR ERRORS
   * - Manually clear error messages
   */
  const clearError = useCallback(() => setError(null), []);

  /**
   * UPDATE USER PROFILE
   * - Updates user data in context and localStorage
   */
  const updateUser = useCallback((updatedUserData) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedUserData };
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  // Value provided to all components using this context
  const value = useMemo(() => ({
    // State
    user,
    setUser,
    loading,           // Initial auth check loading
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    
    // Operation loading states
    operationLoading,   // { login: boolean, register: boolean, google: boolean, logout: boolean }
    
    // Authentication methods
    login,
    register,
    logout,
    googleLogin,
    handleGoogleCallback,
    initiateGoogleLogin,
    
    // Utility methods
    clearError,
    updateUser,
  }), [
    user, 
    loading, 
    error, 
    operationLoading, 
    login, 
    register, 
    logout, 
    googleLogin, 
    handleGoogleCallback, 
    initiateGoogleLogin, 
    clearError, 
    updateUser
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * CUSTOM HOOK: useAuth
 * 
 * WHAT THIS DOES:
 * - Provides easy access to auth context in any component
 * - Throws error if used outside AuthProvider
 * - Cleaner syntax than using useContext directly
 * 
 * USAGE:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};