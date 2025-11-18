// src/services/analyticsService.js - FOLLOWING YOUR EXACT PATTERNS
import api from './api';

export const analyticsService = {
  /**
   * Get analytics metrics overview
   * @param {Object} filters - { startDate, endDate, period }
   */
  getMetrics: async (filters = {}) => {
    try {
      console.log('📊 Fetching analytics metrics...', filters);
      const response = await api.get('/admin/analytics/metrics', { params: filters });
      console.log('✅ Analytics metrics received:', response.data);
      return response.data.data; // ✅ Return just the data array like packageService
    } catch (error) {
      console.error('❌ Error fetching analytics metrics:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get booking trends data
   * @param {Object} filters - { startDate, endDate, period }
   */
  getBookingTrends: async (filters = {}) => {
    try {
      console.log('📈 Fetching booking trends...', filters);
      const response = await api.get('/admin/analytics/booking-trends', { params: filters });
      console.log('✅ Booking trends received:', response.data);
      return response.data.data; // ✅ Return just the data array
    } catch (error) {
      console.error('❌ Error fetching booking trends:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get top performing destinations and packages
   * @param {Object} filters - { limit, startDate, endDate }
   */
  getTopPerformers: async (filters = {}) => {
    try {
      console.log('🏆 Fetching top performers...', filters);
      const response = await api.get('/admin/analytics/top-performers', { params: filters });
      console.log('✅ Top performers received:', response.data);
      return response.data.data; // ✅ Return just the data array
    } catch (error) {
      console.error('❌ Error fetching top performers:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user statistics
   * @param {Object} filters - { startDate, endDate }
   */
  getUserStats: async (filters = {}) => {
    try {
      console.log('👥 Fetching user stats...', filters);
      const response = await api.get('/admin/analytics/user-stats', { params: filters });
      console.log('✅ User stats received:', response.data);
      return response.data.data; // ✅ Return just the data array
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get revenue breakdown
   * @param {Object} filters - { startDate, endDate }
   */
  getRevenueBreakdown: async (filters = {}) => {
    try {
      console.log('💰 Fetching revenue breakdown...', filters);
      const response = await api.get('/admin/analytics/revenue-breakdown', { params: filters });
      console.log('✅ Revenue breakdown received:', response.data);
      return response.data.data; // ✅ Return just the data array
    } catch (error) {
      console.error('❌ Error fetching revenue breakdown:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all analytics data at once (for dashboard)
   * @param {Object} filters - Combined filters for all endpoints
   */
  getAllAnalytics: async (filters = {}) => {
    try {
      console.log('📊 Fetching all analytics data...', filters);
      
      const [metrics, bookingTrends, topPerformers, userStats, revenueBreakdown] = await Promise.all([
        analyticsService.getMetrics(filters),
        analyticsService.getBookingTrends(filters),
        analyticsService.getTopPerformers(filters),
        analyticsService.getUserStats(filters),
        analyticsService.getRevenueBreakdown(filters)
      ]);

      console.log('✅ All analytics data received');
      
      return {
        metrics,
        bookingTrends,
        topPerformers,
        userStats,
        revenueBreakdown
      };
    } catch (error) {
      console.error('❌ Error fetching all analytics data:', error);
      throw error;
    }
  }
};

export default analyticsService;