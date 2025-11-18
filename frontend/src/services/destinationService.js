// src/services/destinationService.js - UPDATED FOR IMAGE UPLOAD
import api from './api';

export const destinationService = {
  /**
   * REGULAR USER: Get all destinations
   */
  getAll: async () => {
    try {
      const response = await api.get('/destinations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * REGULAR USER: Get destination by ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/destinations/${id}`);
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default destinationService;