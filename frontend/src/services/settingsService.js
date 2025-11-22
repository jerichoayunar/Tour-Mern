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

// Get public settings (no auth required)
// Lightweight cache + coalescing for public settings
let _settingsCache = null;
let _settingsCacheExpires = 0;
let _settingsPending = null;
const SETTINGS_CACHE_TTL = 60 * 1000; // 60s

export const getPublicSettings = async () => {
  if (Date.now() < _settingsCacheExpires && _settingsCache && typeof _settingsCache === 'object') {
    return { success: true, data: _settingsCache };
  }

  if (_settingsPending) return _settingsPending;

  _settingsPending = (async () => {
    try {
      const response = await api.get('/settings/public');
      const normalized = normalizeResponse(response);
      if (normalized && normalized.data && typeof normalized.data === 'object') {
        _settingsCache = normalized.data;
        _settingsCacheExpires = Date.now() + SETTINGS_CACHE_TTL;
      }
      return normalized;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      _settingsPending = null;
    }
  })();

  return _settingsPending;
};

// Get all settings (admin only)
export const getAllSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update settings (admin only)
export const updateSettings = async (settingsData) => {
  try {
    const response = await api.put('/admin/settings', settingsData);
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send test email (admin only)
export const sendTestEmail = async (email) => {
  try {
    const response = await api.post('/admin/settings/test-email', { email });
    return normalizeResponse(response);
  } catch (error) {
    throw error.response?.data || error;
  }
};
