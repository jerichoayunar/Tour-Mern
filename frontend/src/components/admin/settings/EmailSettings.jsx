import React, { useState } from 'react';
import Button from '../../ui/Button';

const EmailSettings = ({ initialData, onSave, saving }) => {
  const [notifications, setNotifications] = useState(initialData || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ notifications });
  };

  const handleToggle = (key) => {
    setNotifications({
      ...notifications,
      email: {
        ...notifications.email,
        [key]: !notifications.email?.[key]
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <p className="text-sm text-gray-500 mb-6">Control which emails are sent automatically by the system.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Booking Confirmation</h4>
              <p className="text-xs text-gray-500">Sent to customer after booking</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.email?.bookingConfirmation || false}
                onChange={() => handleToggle('bookingConfirmation')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Admin Notification</h4>
              <p className="text-xs text-gray-500">Sent to admin when new booking is received</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.email?.bookingNotificationAdmin || false}
                onChange={() => handleToggle('bookingNotificationAdmin')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Payment Confirmation</h4>
              <p className="text-xs text-gray-500">Sent to customer after payment is verified</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.email?.paymentConfirmation || false}
                onChange={() => handleToggle('paymentConfirmation')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Inquiry Response</h4>
              <p className="text-xs text-gray-500">Auto-reply when customer submits inquiry</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.email?.inquiryResponse || false}
                onChange={() => handleToggle('inquiryResponse')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
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

export default EmailSettings;
