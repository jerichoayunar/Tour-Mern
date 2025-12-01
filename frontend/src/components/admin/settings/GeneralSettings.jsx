import React, { useState } from 'react';
import Button from '../../ui/Button';

const GeneralSettings = ({ initialData, contactData, businessHoursData, onSave, saving }) => {
  const [general, setGeneral] = useState(initialData || {});
  const [contact, setContact] = useState(contactData || {});
  const [businessHours, setBusinessHours] = useState(businessHoursData || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send all sections at once to avoid multiple API calls and toasts
    onSave({
      general,
      contact,
      businessHours
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Site Name</label>
            <input
              type="text"
              value={general.siteName || ''}
              onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tagline</label>
            <input
              type="text"
              value={general.tagline || ''}
              onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={general.description || ''}
              onChange={(e) => setGeneral({ ...general, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Support Email</label>
            <input
              type="email"
              value={contact.supportEmail || ''}
              onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              value={contact.phone || ''}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={contact.address || ''}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </div>

      {/* Localization removed - not used for runtime formatting. */}

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weekdays (Mon-Fri)</label>
            <input
              type="text"
              value={businessHours.weekday || ''}
              onChange={(e) => setBusinessHours({ ...businessHours, weekday: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Saturday</label>
            <input
              type="text"
              value={businessHours.saturday || ''}
              onChange={(e) => setBusinessHours({ ...businessHours, saturday: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sunday</label>
            <input
              type="text"
              value={businessHours.sunday || ''}
              onChange={(e) => setBusinessHours({ ...businessHours, sunday: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <input
              type="text"
              value={businessHours.timezone || ''}
              onChange={(e) => setBusinessHours({ ...businessHours, timezone: e.target.value })}
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

export default GeneralSettings;
