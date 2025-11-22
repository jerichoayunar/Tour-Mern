// services/authService.js - FIXED VERSION

/**
 * AUTHENTICATION SERVICE - FIXED TO MATCH YOUR BACKEND
 * 
 * Now perfectly matches your Postman response:
 * {
 *   "success": true,
 *   "message": "Login successful", 
 *   "data": {
 *     "_id": "...",
 *     "name": "...",
 *     "email": "...",
 *     "phone": "...", 
 *     "address": "...",
 *     "role": "...",
 *     "token": "..."
 *   }
 * }
 */

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

export const authService = {
  /**
   * REGISTER NEW USER
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return normalizeResponse(response);
  },

  /**
   * LOGIN USER - FIXED
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const resp = response?.data ?? response;

    if (resp.success && resp.data?.token) {
      // Store token automatically
      localStorage.setItem('token', resp.data.token);
    }
    return normalizeResponse(response);
  },

  /**
   * GOOGLE LOGIN (token-based)
   * - Stores the token and returns the user profile from `/auth/me`
   * - This supports the OAuth redirect flow where the backend returns
   *   `token` in the URL and the frontend must persist it and fetch profile
   */
  googleLogin: async (token) => {
    if (!token) throw new Error('No google token provided');
    // Persist token for subsequent requests
    localStorage.setItem('token', token);
    try {
      // fetch the current user using the token
      const response = await api.get('/auth/me');
      return normalizeResponse(response);
    } catch (err) {
      // If fetching profile fails, clear token and rethrow
      localStorage.removeItem('token');
      throw err;
    }
  },

  /**
   * GET CURRENT USER PROFILE - FIXED
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return normalizeResponse(response);
  },

logout: async () => {
  try {
    // Call backend logout endpoint to record activity
    const response = await api.post('/auth/logout');
    return normalizeResponse(response);
  } catch (error) {
    console.log('Backend logout call failed:', error);
    throw error;
  }
},

clearLocalAuth: () => {
  // Clear frontend storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
},

  /**
 * FORGOT PASSWORD - FIXED
 */
  forgotPassword: async (requestData) => {
  console.log('🔍 authService.forgotPassword called with:', {
    email: requestData.email,
    hasToken: !!requestData.recaptchaToken,
    tokenLength: requestData.recaptchaToken?.length
  });

    try {
      const response = await api.post('/auth/forgot-password', requestData);
      const resp = response?.data ?? response;
      console.log('🔍 authService response:', resp);
      return normalizeResponse(response);
    } catch (error) {
      console.error('🔍 authService error:', error.response?.data || error.message);
      throw error;
    }
},

  // Add to authService.js
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return normalizeResponse(response);
  },

  /**
   * CHANGE PASSWORD
   */
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return normalizeResponse(response);
  },

  /**
   * GET STORED TOKEN
   */
  getStoredToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * UPDATE USER PROFILE
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return normalizeResponse(response);
  }
};

export const {
  register,
  login,
  googleLogin,
  getMe,
  logout,
  clearLocalAuth,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getStoredToken
} = authService;