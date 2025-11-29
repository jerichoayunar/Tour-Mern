// src/hooks/usePackages.js - CLEANED UP FOR USER FRONTEND ONLY
import { useState, useEffect, useContext } from 'react';
import packageService from '../services/packageService';
import ToastContext from '../context/ToastContext';

export const usePackages = (initialFilters = {}) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const { showToast } = useContext(ToastContext);

  // Fetch packages - ONLY ON MOUNT
  useEffect(() => {
    console.log('🔄 Fetching packages on mount...');
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await packageService.getPackages({});
        // Normalize response: support { success, data }, axios response, or raw array
        const resp = response?.data ?? response;
        let packagesData = [];
        if (Array.isArray(resp)) packagesData = resp;
        else if (resp && resp.success !== undefined) packagesData = Array.isArray(resp.data) ? resp.data : [];
        else packagesData = Array.isArray(resp?.data) ? resp.data : [];

        console.log('✅ Packages fetched successfully:', packagesData.length);
        setPackages(packagesData);
      } catch (err) {
        console.error('❌ Error fetching packages:', err);
        const errorMessage = err.message || 'Failed to fetch packages';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [showToast]);

  // Manual refetch function
  const refetchPackages = async (customFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
    console.log('🔄 Refetching packages with filters:', customFilters);
    const response = await packageService.getPackages(customFilters);
    const resp = response?.data ?? response;
    let packagesData = [];
    if (Array.isArray(resp)) packagesData = resp;
    else if (resp && resp.success !== undefined) packagesData = Array.isArray(resp.data) ? resp.data : [];
    else packagesData = Array.isArray(resp?.data) ? resp.data : [];

    console.log('✅ Packages refetched:', packagesData.length);
    setPackages(packagesData);
    } catch (err) {
      console.error('❌ Error refetching packages:', err);
      const errorMessage = err.message || 'Failed to fetch packages';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    console.log('🔄 Updating filters state:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    setFilters({});
    refetchPackages({});
  };

  // Get single package (for package detail page)
  const fetchPackage = async (packageId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await packageService.getPackage(packageId);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch package';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    packages,
    loading,
    error,
    filters,
    fetchPackages: refetchPackages,
    updateFilters,
    clearFilters,
    fetchPackage
  
  };
};