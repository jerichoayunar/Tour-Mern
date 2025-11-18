// src/services/userService.js - USES /api/clients ENDPOINTS
import api from './api';

export const userService = {
  /**
   * ADMIN: Get all users (from /api/clients)
   */
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/clients', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * ADMIN: Get user by ID (from /api/clients/:id)
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/clients/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * ADMIN: Update user (from /api/clients/:id)
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/clients/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * ADMIN: Delete user (from /api/clients/:id)
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/clients/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * ADMIN: Get user statistics (from /api/clients/stats)
   */
  getUserStats: async () => {
    try {
      const response = await api.get('/clients/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService;