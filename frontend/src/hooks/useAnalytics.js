// src/hooks/useAnalytics.js - FIXED IMPORT
import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { analyticsService } from '../services/analyticsService';
import ToastContext from '../context/ToastContext'; // FIXED: Default import

export const useAnalytics = (initialFilters = {}) => {
  const [data, setData] = useState({
    metrics: null,
    bookingTrends: null,
    topPerformers: null,
    userStats: null,
    revenueBreakdown: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const { showToast } = useContext(ToastContext); // Now this will work
  
  // 🛠️ ADD: Abort controller ref for request cancellation (like useBookings)
  const abortControllerRef = useRef(null);

  // ============================================================================
  // 🗄️ MODULE-LEVEL CACHE: Keep analytics data between mounts
  // - Simple in-memory cache avoids refetching when navigating between pages
  // - TTL (ms) prevents stale data
  // ============================================================================
  const CACHE_TTL = 60 * 1000; // 60 seconds
  // Use module-level cache so it's shared across hook instances
  if (typeof window !== 'undefined' && !window.__ANALYTICS_CACHE) {
    window.__ANALYTICS_CACHE = { data: null, filters: null, ts: 0 };
  }
  const cache = typeof window !== 'undefined' ? window.__ANALYTICS_CACHE : { data: null, filters: null, ts: 0 };

  // ============================================================================
  // 🎯 REQUEST CLEANUP - PREVENT MEMORY LEAKS (like useBookings)
  // ============================================================================
  useEffect(() => {
    return () => {
      // Cancel any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================================================
  // 🎯 FETCH ANALYTICS DATA - OPTIMIZED (like useBookings)
  // ============================================================================
  const fetchAnalyticsData = useCallback(async (customFilters = null) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const currentFilters = customFilters || filters;
      // Check cache first (simple shallow equality on filters)
      const now = Date.now();
      const cacheValid = cache.data && (now - cache.ts) < CACHE_TTL && JSON.stringify(cache.filters) === JSON.stringify(currentFilters);
      if (cacheValid) {
        setData(cache.data);
        setLoading(false);
        console.log('✅ Using cached analytics data');
        return cache.data;
      }
      console.log('🔄 Fetching analytics data with filters:', currentFilters);
      
      // Use the batch method to fetch all analytics data at once
      const analyticsData = await analyticsService.getAllAnalytics(currentFilters);
      
      // 🛠️ FIX: Check if request was cancelled before updating state
      if (!abortControllerRef.current.signal.aborted) {
        setData(analyticsData);
        // Save to cache
        try {
          cache.data = analyticsData;
          cache.filters = currentFilters;
          cache.ts = Date.now();
        } catch (e) {
          console.debug('Failed to write analytics cache', e);
        }
        console.log('✅ Analytics data fetched successfully');
      }
    } catch (err) {
      // 🛠️ FIX: Don't show errors for cancelled requests
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        console.log('ℹ️ Analytics request cancelled');
        return;
      }
      
      const errorMessage = err.message || 'Failed to fetch analytics data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      
      console.error('❌ Fetch analytics error:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [filters, showToast]);

  // ============================================================================
  // 🎯 FETCH SPECIFIC ANALYTICS DATA (individual endpoints)
  // ============================================================================
  const fetchMetrics = useCallback(async (customFilters = null) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching metrics data...');
      const currentFilters = customFilters || filters;
      const metrics = await analyticsService.getMetrics(currentFilters);
      
      setData(prev => ({ ...prev, metrics }));
      console.log('✅ Metrics data fetched successfully');
      return metrics;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch metrics data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('❌ Fetch metrics error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  const fetchBookingTrends = useCallback(async (customFilters = null) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching booking trends...');
      const currentFilters = customFilters || filters;
      const bookingTrends = await analyticsService.getBookingTrends(currentFilters);
      
      setData(prev => ({ ...prev, bookingTrends }));
      console.log('✅ Booking trends fetched successfully');
      return bookingTrends;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch booking trends';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('❌ Fetch booking trends error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  // ============================================================================
  // 🎯 FILTER MANAGEMENT - OPTIMIZED (like useBookings)
  // ============================================================================
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // ============================================================================
  // 🎯 AUTO-FETCH ON FILTERS CHANGE (like usePackages)
  // ============================================================================
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // ============================================================================
  // 🎯 RETURN HOOK API (following your pattern)
  // ============================================================================
  return {
    // State
    data,
    loading,
    error,
    filters,
    
    // Actions - batch operations
    fetchAnalyticsData,
    refreshAnalytics: fetchAnalyticsData,
    
    // Actions - individual operations
    fetchMetrics,
    fetchBookingTrends,
    fetchTopPerformers: useCallback(async (customFilters = null) => {
      setLoading(true);
      setError(null);
      try {
        const currentFilters = customFilters || filters;
        const topPerformers = await analyticsService.getTopPerformers(currentFilters);
        setData(prev => ({ ...prev, topPerformers }));
        return topPerformers;
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch top performers';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [filters, showToast]),
    
    fetchUserStats: useCallback(async (customFilters = null) => {
      setLoading(true);
      setError(null);
      try {
        const currentFilters = customFilters || filters;
        const userStats = await analyticsService.getUserStats(currentFilters);
        setData(prev => ({ ...prev, userStats }));
        return userStats;
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch user stats';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [filters, showToast]),

    fetchRevenueBreakdown: useCallback(async (customFilters = null) => {
      setLoading(true);
      setError(null);
      try {
        const currentFilters = customFilters || filters;
        const revenueBreakdown = await analyticsService.getRevenueBreakdown(currentFilters);
        setData(prev => ({ ...prev, revenueBreakdown }));
        return revenueBreakdown;
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch revenue breakdown';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [filters, showToast]),

    // Filter management
    updateFilters,
    clearFilters,
    
    // 🛠️ ADD: Utility function to cancel pending requests (like useBookings)
    cancelRequests: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  };
};

export default useAnalytics;