// services/api.js - FIXED VERSION

/**
 * API CONFIGURATION SERVICE - FIXED
 * 
 * CHANGES:
 * - Removed automatic redirect on 401 errors
 * - Let components handle auth errors appropriately
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with  base config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
}); 

// Add token to all requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors globally - FIXED
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect automatically - let components handle errors
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required');
      localStorage.removeItem('token');
      // ✅ REMOVED: window.location.href = '/login';
      // Let the login component handle the error display
    }
    return Promise.reject(error);
  }
);

export default api;