// src/services/packageService.js - UPDATED FOR FORMDATA & ITINERARY
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

// PUBLIC & ADMIN: Get all packages
export const getPackages = async (filters = {}) => {
  try {
    const response = await api.get('/packages', { params: filters });
    const resp = response?.data ?? response;
    console.log('📦 Packages API Response:', resp);
    return normalizeResponse(response);
  } catch (error) {
    console.error('📦 Packages API Error:', error);
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

// ADMIN: Create new package (UPDATED FOR FORMDATA)
export const createPackage = async (packageData) => {
  try {
    console.log('💾 Creating package with data:', packageData);
    
    // Check if it's FormData (file upload) or regular JSON
    const isFormData = packageData instanceof FormData;
    
    const config = isFormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    
    const response = await api.post('/packages', packageData, config);
    const resp = response?.data ?? response;
    console.log('✅ Create Package Response:', resp);
    return normalizeResponse(response);
  } catch (error) {
    console.error('❌ Create Package Error:', error);
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

// ADMIN: Update package (UPDATED FOR FORMDATA)
export const updatePackage = async (packageId, packageData) => {
  try {
    console.log('✏️ Updating package:', packageId, packageData);
    
    // Check if it's FormData (file upload) or regular JSON
    const isFormData = packageData instanceof FormData;
    
    const config = isFormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    
    const response = await api.put(`/packages/${packageId}`, packageData, config);
    const resp = response?.data ?? response;
    console.log('✅ Update Package Response:', resp);
    return normalizeResponse(response);
  } catch (error) {
    console.error('❌ Update Package Error:', error);
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

// ADMIN: Delete package
export const deletePackage = async (packageId) => {
  try {
    console.log('🗑️ Deleting package:', packageId);
    const response = await api.delete(`/packages/${packageId}`);
    const resp = response?.data ?? response;
    console.log('✅ Delete Package Response:', resp);
    return normalizeResponse(response);
  } catch (error) {
    console.error('❌ Delete Package Error:', error);
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

// ADMIN: Archive package
export const archivePackage = async (packageId, reason) => {
  try {
    const response = await api.put(`/packages/${packageId}/archive`, { reason });
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

// ADMIN: Restore package
export const restorePackage = async (packageId) => {
  try {
    const response = await api.put(`/packages/${packageId}/restore`);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

// ADMIN: Permanently delete package
export const deletePackagePermanent = async (packageId) => {
  try {
    const response = await api.delete(`/packages/${packageId}/permanent`);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

// REGULAR USER: Get single package
export const getPackage = async (packageId) => {
  try {
    const response = await api.get(`/packages/${packageId}`);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

export default {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  archivePackage,
  restorePackage,
  deletePackagePermanent,
  getPackage
};
