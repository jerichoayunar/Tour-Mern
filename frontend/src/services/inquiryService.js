// src/services/inquiryService.js
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

const getInquiries = async (params = {}) => {
  try {
    const response = await api.get('/inquiries', { params });
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const getInquiryStats = async () => {
  try {
    const response = await api.get('/inquiries/stats');
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const getInquiryById = async (id) => {
  try {
    const response = await api.get(`/inquiries/${id}`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const updateInquiry = async (id, updateData) => {
  try {
    const response = await api.put(`/inquiries/${id}`, updateData);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const markAsRead = async (id) => {
  try {
    const response = await api.put(`/inquiries/${id}/read`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const deleteInquiry = async (id) => {
  try {
    const response = await api.delete(`/inquiries/${id}`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const createInquiry = async (inquiryData) => {
  try {
    const response = await api.post('/inquiries', inquiryData);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const archiveInquiry = async (id, reason = null) => {
  try {
    const response = await api.put(`/inquiries/${id}/archive`, { reason });
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const restoreInquiry = async (id) => {
  try {
    const response = await api.put(`/inquiries/${id}/restore`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

const permanentDeleteInquiry = async (id) => {
  try {
    const response = await api.delete(`/inquiries/${id}/permanent`);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getInquiries,
  getInquiryStats,
  getInquiryById,
  updateInquiry,
  markAsRead,
  deleteInquiry,
  createInquiry,
  archiveInquiry,
  restoreInquiry,
  permanentDeleteInquiry
};