// src/services/inquiryService.js
import api from './api';

const getInquiries = async (params = {}) => {
  const response = await api.get('/inquiries', { params });
  return response.data;
};

const getInquiryStats = async () => {
  const response = await api.get('/inquiries/stats');
  return response.data;
};

const getInquiryById = async (id) => {
  const response = await api.get(`/inquiries/${id}`);
  return response.data;
};

const updateInquiry = async (id, updateData) => {
  const response = await api.put(`/inquiries/${id}`, updateData);
  return response.data;
};

const markAsRead = async (id) => {
  const response = await api.put(`/inquiries/${id}/read`);
  return response.data;
};

const deleteInquiry = async (id) => {
  const response = await api.delete(`/inquiries/${id}`);
  return response.data;
};

const createInquiry = async (inquiryData) => {
  const response = await api.post('/inquiries', inquiryData);
  return response.data;
};

export default {
  getInquiries,
  getInquiryStats,
  getInquiryById,
  updateInquiry,
  markAsRead,
  deleteInquiry,
  createInquiry
};