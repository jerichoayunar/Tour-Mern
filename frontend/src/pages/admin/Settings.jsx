import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getAllSettings, updateSettings } from '../../services/settingsService';
import Loader from '../../components/ui/Loader';
import GeneralSettings from '../../components/admin/settings/GeneralSettings';
import BookingSettings from '../../components/admin/settings/BookingSettings';
import EmailSettings from '../../components/admin/settings/EmailSettings';
import SecuritySettings from '../../components/admin/settings/SecuritySettings';

const Settings = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  // Fetch all settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getAllSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates) => {
    try {
      setSaving(true);
      
      const response = await updateSettings(updates);
      
      if (response.success) {
        setSettings(response.data);
        showToast('Settings updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="large" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '🏢' },
    { id: 'booking', label: 'Booking', icon: '📅' },
    { id: 'email', label: 'Email & Notifications', icon: '📧' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Manage your website configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'general' && (
          <GeneralSettings 
            initialData={settings?.general} 
            contactData={settings?.contact}
            localizationData={settings?.localization}
            businessHoursData={settings?.businessHours}
            onSave={handleSave} 
            saving={saving} 
          />
        )}
        
        {activeTab === 'booking' && (
          <BookingSettings 
            initialData={settings?.booking} 
            onSave={handleSave} 
            saving={saving} 
          />
        )}
        
        {activeTab === 'email' && (
          <EmailSettings 
            initialData={settings?.notifications} 
            onSave={handleSave} 
            saving={saving} 
          />
        )}

        {activeTab === 'security' && (
          <SecuritySettings 
            initialData={settings?.security} 
            onSave={handleSave} 
            saving={saving} 
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
