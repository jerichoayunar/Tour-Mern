import api from './api';

// Get public settings (no auth required)
export const getPublicSettings = async () => {
  const response = await api.get('/settings/public');
  return response.data;
};

// Get all settings (admin only)
export const getAllSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

// Update settings (admin only)
export const updateSettings = async (settingsData) => {
  const response = await api.put('/admin/settings', settingsData);
  return response.data;
};

// Send test email (admin only)
export const sendTestEmail = async (email) => {
  const response = await api.post('/admin/settings/test-email', { email });
  return response.data;
};
