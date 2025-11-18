// src/services/adminService.js - ENHANCED VERSION
import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await api.get('/admin/dashboard/stats');
      console.log('✅ Dashboard stats received:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getRecentBookings: async () => {
    try {
      console.log('📋 Fetching recent bookings...');
      const response = await api.get('/admin/dashboard/recent-bookings');
      console.log('✅ Recent bookings received:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching recent bookings:', error);
      throw error;
    }
  },

  getRevenueStats: async () => {
    try {
      console.log('💰 Fetching revenue stats...');
      const response = await api.get('/admin/dashboard/revenue-stats');
      console.log('✅ Revenue stats received:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching revenue stats:', error);
      throw error;
    }
  },

  // NEW: Export dashboard data
  exportDashboardData: async (format = 'csv') => {
    try {
      console.log(`📤 Exporting dashboard data as ${format}...`);
      const response = await api.get(`/admin/dashboard/export?format=${format}`, {
        responseType: 'blob'
      });
      console.log('✅ Export completed');
      return response;
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }
};

export default adminService;