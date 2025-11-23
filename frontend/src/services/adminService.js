// src/services/adminService.js - ENHANCED VERSION
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

export const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return normalizeResponse(response);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
    }
  },

  getRecentBookings: async () => {
    try {
      const response = await api.get('/admin/dashboard/recent-bookings');
      return normalizeResponse(response);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
    }
  },

  getRevenueStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/revenue-stats');
      return normalizeResponse(response);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
    }
  },

  // Export dashboard data (returns blob in data when responseType=blob)
  exportDashboardData: async (format = 'csv') => {
    try {
      const response = await api.get(`/admin/dashboard/export?format=${format}`, {
        responseType: 'blob'
      });
      // Wrap blob in canonical shape using resolved payload
      const resp = response?.data ?? response;
      return { success: true, data: resp, message: 'Export ready' };
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || String(error);
      throw { success: false, message, response: { data: { message } } };
    }
  }
};

export default adminService;