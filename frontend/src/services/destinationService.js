// src/services/destinationService.js - UPDATED FOR IMAGE UPLOAD
import api from './api';

// Simple in-memory cache + coalescing for getAll to avoid duplicate requests
let _destinationsCache = null;
let _destinationsCacheExpires = 0;
let _destinationsPending = null;
const DEST_CACHE_TTL = 60 * 1000; // 60s

const normalizeResponse = (response) => {
  const payload = response?.data || {};
  return {
    success: payload.success,
    data: payload.data ?? payload,
    message: payload.message,
    token: payload.data?.token ?? payload.token
  };
};

export const destinationService = {
  /**
   * REGULAR USER: Get all destinations
   */
  getAll: async () => {
    // Return cached data if still fresh
    if (Date.now() < _destinationsCacheExpires && Array.isArray(_destinationsCache)) {
      return { success: true, data: _destinationsCache };
    }

    // If a request is already pending, return the same promise to coalesce
    if (_destinationsPending) return _destinationsPending;

    _destinationsPending = (async () => {
      try {
        const response = await api.get('/destinations');
        const normalized = normalizeResponse(response);
        // cache array payloads
        if (normalized && Array.isArray(normalized.data)) {
          _destinationsCache = normalized.data;
          _destinationsCacheExpires = Date.now() + DEST_CACHE_TTL;
        }
        return normalized;
      } catch (error) {
        throw error.response?.data || error.message;
      } finally {
        _destinationsPending = null;
      }
    })();

    return _destinationsPending;
  },

  /**
   * REGULAR USER: Get destination by ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/destinations/${id}`);
      return normalizeResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * ADMIN: Create new destination WITH IMAGE UPLOAD
   */
  createDestination: async (destinationData) => {
    try {
      // Check if we have a file to upload (FormData) or regular data
      const isFormData = destinationData instanceof FormData;
      
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : {};

      const response = await api.post('/destinations', destinationData, config);
      return normalizeResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * ADMIN: Update destination WITH IMAGE UPLOAD
   */
  updateDestination: async (destinationId, destinationData) => {
    try {
      // Check if we have a file to upload (FormData) or regular data
      const isFormData = destinationData instanceof FormData;
      
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : {};

      const response = await api.put(`/destinations/${destinationId}`, destinationData, config);
      return normalizeResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * ADMIN: Delete destination
   */
  deleteDestination: async (destinationId) => {
    try {
      const response = await api.delete(`/destinations/${destinationId}`);
      return normalizeResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default destinationService;