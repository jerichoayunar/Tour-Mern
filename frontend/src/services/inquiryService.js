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
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const getMyInquiries = async (params = {}) => {
  try {
    const response = await api.get('/inquiries/my', { params });
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const addUserReply = async (id, body) => {
  try {
    const response = await api.post(`/inquiries/${id}/reply`, body);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const getInquiryStats = async () => {
  try {
    const response = await api.get('/inquiries/stats');
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const getInquiryById = async (id) => {
  try {
    const response = await api.get(`/inquiries/${id}`);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const updateInquiry = async (id, updateData) => {
  try {
    const response = await api.put(`/inquiries/${id}`, updateData);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const markAsRead = async (id) => {
  try {
    const response = await api.put(`/inquiries/${id}/read`);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const deleteInquiry = async (id) => {
  try {
    const response = await api.delete(`/inquiries/${id}`);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const createInquiry = async (inquiryData) => {
  try {
    // Use a timeout wrapper to avoid hanging promises and provide clearer errors
    const timeoutMs = 15000; // 15 seconds
    const postPromise = api.post('/inquiries', inquiryData);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs));
    const response = await Promise.race([postPromise, timeoutPromise]);
    return normalizeResponse(response);
  } catch (error) {
    const rawMessage = error?.response?.data?.message || error?.message || String(error);
    const message = rawMessage === 'Request timeout' ? 'The request timed out. Please try again.' : rawMessage;
    throw { success: false, message, response: { data: { message } } };
  }
};

const archiveInquiry = async (id, reason = null) => {
  try {
    const response = await api.put(`/inquiries/${id}/archive`, { reason });
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const restoreInquiry = async (id) => {
  try {
    const response = await api.put(`/inquiries/${id}/restore`);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
  }
};

const permanentDeleteInquiry = async (id) => {
  try {
    const response = await api.delete(`/inquiries/${id}/permanent`);
    return normalizeResponse(response);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || String(error);
    throw { success: false, message, response: { data: { message } } };
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
    , getMyInquiries
    , addUserReply
};