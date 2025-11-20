import { createContext, useContext, useState, useEffect } from 'react';
import { getPublicSettings } from '../services/settingsService';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Bukidnon Tours',
      tagline: 'Adventure Awaits',
      description: 'Your trusted partner for exploring breathtaking landscapes.',
      logo: '',
    },
    contact: {
      supportEmail: 'info@bukidnontours.com',
      phone: '+63 912 345 6789',
      address: 'Bukidnon, Philippines',
      city: 'Malaybalay',
      country: 'Philippines',
    },
    businessHours: {
      weekday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 5:00 PM',
      sunday: 'Closed',
    },
    socialMedia: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      tiktok: 'https://tiktok.com',
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await getPublicSettings();
      if (response && response.data) {
        setSettings(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    setLoading(true);
    fetchSettings();
  };

  const value = {
    settings,
    loading,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
