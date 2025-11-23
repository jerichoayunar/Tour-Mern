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
   * Accepts optional params object, e.g. { onlyArchived: 'true' }
   */
  getAll: async (params) => {
    // Only use cache when no params passed
    if ((!params || Object.keys(params).length === 0) && Date.now() < _destinationsCacheExpires && Array.isArray(_destinationsCache)) {
      return { success: true, data: _destinationsCache };
    }

    // If a request is already pending and no params, return the same promise to coalesce
    if ((!params || Object.keys(params).length === 0) && _destinationsPending) return _destinationsPending;

    const fetcher = (async () => {
      try {
        const response = await api.get('/destinations', { params });
        const normalized = normalizeResponse(response);
        // cache array payloads only when no params
        if ((!params || Object.keys(params).length === 0) && normalized && Array.isArray(normalized.data)) {
          _destinationsCache = normalized.data;
          _destinationsCacheExpires = Date.now() + DEST_CACHE_TTL;
        }
        return normalized;
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || String(error);
        throw { success: false, message, response: { data: { message } } };
      } finally {
        _destinationsPending = null;
      }
    })();

    if (!params || Object.keys(params).length === 0) _destinationsPending = fetcher;
    return fetcher;
  },

  /**
   * REGULAR USER: Get destination by ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/destinations/${id}`);
      return normalizeResponse(response);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
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
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
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
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
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
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
    }
  }
  ,

  /**
   * ADMIN: Archive (soft-delete) a destination
   */
  archiveDestination: async (destinationId) => {
    try {
      const response = await api.put(`/destinations/${destinationId}/archive`);
      return normalizeResponse(response);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
    }
  },

  /**
   * ADMIN: Restore an archived destination
   */
  restoreDestination: async (destinationId) => {
    try {
      const response = await api.put(`/destinations/${destinationId}/restore`);
      return normalizeResponse(response);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
    }
  },

  /**
   * ADMIN: Permanently delete a destination
   */
  deleteDestinationPermanent: async (destinationId) => {
    try {
      const response = await api.delete(`/destinations/${destinationId}/permanent`);
      return normalizeResponse(response);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
    }
  }
};

export default destinationService;