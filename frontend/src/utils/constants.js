// utils/constants.js

/**
 * Application Constants
 * Centralized configuration for reusable values
 */

// reCAPTCHA Configuration
export const RECAPTCHA_SITE_KEY = '6Le-0vArAAAAAJ06A7o9QQastlH_bO_XpFeTdr-5';

// API Configuration
export const API_BASE_URL = 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

// Default Messages
export const MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.'
};