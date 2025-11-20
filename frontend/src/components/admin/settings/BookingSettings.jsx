import React, { useState } from 'react';
import Button from '../../ui/Button';

const BookingSettings = ({ initialData, onSave, saving }) => {
  const [booking, setBooking] = useState(initialData || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ booking });
  };

  const handlePaymentMethodChange = (method) => {
    setBooking({
      ...booking,
      paymentMethods: {
        ...booking.paymentMethods,
        [method]: !booking.paymentMethods?.[method]
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Booking Rules */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Rules</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min. Advance Booking (Days)</label>
            <input
              type="number"
              min="0"
              value={booking.minAdvanceDays || 0}
              onChange={(e) => setBooking({ ...booking, minAdvanceDays: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Group Size</label>
            <input
              type="number"
              min="1"
              value={booking.maxGroupSize || 1}
              onChange={(e) => setBooking({ ...booking, maxGroupSize: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoConfirm"
              checked={booking.autoConfirm || false}
              onChange={(e) => setBooking({ ...booking, autoConfirm: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoConfirm" className="ml-2 block text-sm text-gray-900">
              Auto-confirm bookings
            </label>
          </div>
        </div>
      </div>

      {/* Deposit Settings */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Deposit Settings</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-2 flex items-center mb-2">
            <input
              type="checkbox"
              id="requireDeposit"
              checked={booking.requireDeposit || false}
              onChange={(e) => setBooking({ ...booking, requireDeposit: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requireDeposit" className="ml-2 block text-sm text-gray-900">
              Require Deposit
            </label>
          </div>
          
          {booking.requireDeposit && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deposit Type</label>
                <select
                  value={booking.depositType || 'percentage'}
                  onChange={(e) => setBooking({ ...booking, depositType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount ({booking.depositType === 'percentage' ? '%' : 'Value'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={booking.depositAmount || 0}
                  onChange={(e) => setBooking({ ...booking, depositAmount: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="manualPayment"
              checked={booking.paymentMethods?.manualPayment || false}
              onChange={() => handlePaymentMethodChange('manualPayment')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="manualPayment" className="ml-2 block text-sm text-gray-900">
              Manual Payment / Bank Transfer
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="cashOnPickup"
              checked={booking.paymentMethods?.cashOnPickup || false}
              onChange={() => handlePaymentMethodChange('cashOnPickup')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="cashOnPickup" className="ml-2 block text-sm text-gray-900">
              Cash on Pickup / Arrival
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="paypal"
              checked={booking.paymentMethods?.paypal || false}
              onChange={() => handlePaymentMethodChange('paypal')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="paypal" className="ml-2 block text-sm text-gray-900">
              PayPal (Requires Integration)
            </label>
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

export default BookingSettings;
