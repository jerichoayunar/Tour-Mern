import React, { useState } from 'react';
import Button from '../../ui/Button';

const SecuritySettings = ({ initialData, onSave, saving }) => {
  const [security, setSecurity] = useState(initialData || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ security });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <p className="text-sm text-gray-500 mb-6">Configure security policies for your application.</p>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Session Timeout</label>
            <select
              value={security.sessionTimeout || '30d'}
              onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
            <input
              type="number"
              min="3"
              max="10"
              value={security.maxLoginAttempts || 5}
              onChange={(e) => setSecurity({ ...security, maxLoginAttempts: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" variant="primary" isLoading={saving}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default SecuritySettings;
