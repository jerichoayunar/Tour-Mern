// src/components/booking/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { useToast } from '../../../context/ToastContext';
import Loader from "../../ui/Loader";
import { X, Calendar, Users, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { formatPrice } from '../../../utils/formatters';

const BookingForm = ({ package: tourPackage, onSuccess, onCancel }) => {
  const { createNewBooking, loading } = useBooking();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    packageId: tourPackage?._id || '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    bookingDate: '',
    guests: 1,
    specialRequests: ''
  });

  const [errors, setErrors] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Calculate price when guests or package changes
  useEffect(() => {
    if (tourPackage && formData.guests > 0) {
      setCalculatedPrice(tourPackage.price * formData.guests);
    }
  }, [formData.guests, tourPackage]);

  // Auto-fill user data if available
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setFormData(prev => ({
        ...prev,
        clientName: userData.name || '',
        clientEmail: userData.email || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) newErrors.clientName = 'Name is required';
    if (!formData.clientEmail.trim()) newErrors.clientEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) newErrors.clientEmail = 'Email is invalid';
    
    if (!formData.clientPhone.trim()) newErrors.clientPhone = 'Phone is required';
    if (!formData.bookingDate) newErrors.bookingDate = 'Booking date is required';
    
    if (!formData.guests || formData.guests < 1) newErrors.guests = 'At least 1 guest is required';
    if (!formData.packageId) newErrors.packageId = 'Package is required';

    // Validate booking date is not in the past
    const selectedDate = new Date(formData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (formData.bookingDate && selectedDate < today) {
      newErrors.bookingDate = 'Booking date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    try {
      await createNewBooking(formData);
      showToast('Booking created successfully!', 'success');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showToast(error.message || 'Failed to create booking', 'error');
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!tourPackage) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl">
        No package selected for booking
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full mx-auto relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-6 text-white relative">
        <h2 className="text-2xl font-bold">Book Your Adventure</h2>
        <p className="text-white/90 text-sm mt-1">{tourPackage.title}</p>
        
        {onCancel && (
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User size={16} className="text-primary-500" />
              Full Name *
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.clientName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
            />
            {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="clientEmail" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail size={16} className="text-primary-500" />
              Email *
            </label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.clientEmail ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
            />
            {errors.clientEmail && <p className="text-xs text-red-500 mt-1">{errors.clientEmail}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="clientPhone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone size={16} className="text-primary-500" />
              Phone *
            </label>
            <input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.clientPhone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
            />
            {errors.clientPhone && <p className="text-xs text-red-500 mt-1">{errors.clientPhone}</p>}
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <label htmlFor="guests" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users size={16} className="text-primary-500" />
              Number of Guests *
            </label>
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.guests ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none bg-white`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            {errors.guests && <p className="text-xs text-red-500 mt-1">{errors.guests}</p>}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label htmlFor="bookingDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar size={16} className="text-primary-500" />
            Booking Date *
          </label>
          <input
            type="date"
            id="bookingDate"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            min={getMinDate()}
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.bookingDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
          />
          {errors.bookingDate && <p className="text-xs text-red-500 mt-1">{errors.bookingDate}</p>}
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <label htmlFor="specialRequests" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare size={16} className="text-primary-500" />
            Special Requests
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requirements, dietary restrictions, or requests..."
            rows="3"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-primary-200 focus:border-primary-500 focus:ring-4 transition-all outline-none resize-none"
          />
        </div>

        {/* Price Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Price Summary</h3>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>{tourPackage.title} × {formData.guests}</span>
            <span>{formatPrice(tourPackage.price)} × {formData.guests}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="font-bold text-gray-900">Total Amount:</span>
            <span className="text-xl font-bold text-primary-600">{formatPrice(calculatedPrice)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size="small" color="white" />
                <span>Processing...</span>
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;