// src/services/packageService.js - UPDATED FOR FORMDATA & ITINERARY
import api from './api';

// PUBLIC & ADMIN: Get all packages
export const getPackages = async (filters = {}) => {
  try {
    const response = await api.get('/packages', { params: filters });
    console.log('📦 Packages API Response:', response.data);
    
    // Handle the response structure: { success: true, data: [...] }
    return response.data.data; // ✅ Return just the array of packages
  } catch (error) {
    console.error('📦 Packages API Error:', error);
    throw error.response?.data || error.message;
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
    console.log('✅ Create Package Response:', response.data);
    return response.data.data; // ✅ Return the created package
  } catch (error) {
    console.error('❌ Create Package Error:', error);
    throw error.response?.data || error.message;
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
    console.log('✅ Update Package Response:', response.data);
    return response.data.data; // ✅ Return the updated package
  } catch (error) {
    console.error('❌ Update Package Error:', error);
    throw error.response?.data || error.message;
  }
};

// ADMIN: Delete package
export const deletePackage = async (packageId) => {
  try {
    console.log('🗑️ Deleting package:', packageId);
    const response = await api.delete(`/packages/${packageId}`);
    console.log('✅ Delete Package Response:', response.data);
    return response.data; // ✅ Return the success message
  } catch (error) {
    console.error('❌ Delete Package Error:', error);
    throw error.response?.data || error.message;
  }
};

// REGULAR USER: Get single package
export const getPackage = async (packageId) => {
  try {
    const response = await api.get(`/packages/${packageId}`);
    return response.data.data; // ✅ Return just the package object
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getPackage
};