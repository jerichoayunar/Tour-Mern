// src/components/booking/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import Loader from "../../ui/Loader";
import { X, Calendar, Users, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { formatPrice } from '../../../utils/formatters';

const BookingForm = ({ package: tourPackage, packages: tourPackages, onSuccess, onCancel }) => {
  const { createNewBooking, loading } = useBooking();
  const { showToast } = useToast();
  const { isAuthenticated, requireAuthRedirect } = useAuth();

  const initialPackageId = tourPackage?._id || '';
  const initialPackageIds = (Array.isArray(tourPackages) && tourPackages.length > 0)
    ? tourPackages.map(p => p._id)
    : (initialPackageId ? [initialPackageId] : []);

  const [formData, setFormData] = useState({
    packageId: initialPackageId,
    packageIds: initialPackageIds,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    bookingDate: '',
    guests: 1,
    specialRequests: ''
  });

  const [errors, setErrors] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Calculate price when guests or package(s) changes
  useEffect(() => {
    const guests = Number(formData.guests) || 1;
    if (Array.isArray(tourPackages) && tourPackages.length > 0) {
      const sum = tourPackages.reduce((acc, p) => acc + (p.price || 0), 0);
      setCalculatedPrice(sum * guests);
    } else if (tourPackage) {
      setCalculatedPrice((tourPackage.price || 0) * guests);
    }
  }, [formData.guests, tourPackage, tourPackages]);

  // Read admin-controlled booking rules
  const { settings } = useSettings();
  const minAdvanceDays = settings?.booking?.minAdvanceDays ?? 0;
  const minGroupSize = settings?.booking?.minGroupSize ?? 1;
  const maxGroupSize = settings?.booking?.maxGroupSize ?? 15;

  // Ensure guests defaults/clamped to settings range whenever settings change
  useEffect(() => {
    setFormData(prev => {
      const current = Number(prev.guests) || minGroupSize;
      const clamped = Math.max(minGroupSize, Math.min(maxGroupSize, current));
      if (clamped !== current) return { ...prev, guests: clamped };
      return prev;
    });
  }, [minGroupSize, maxGroupSize]);

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
    if (formData.guests < minGroupSize) newErrors.guests = `Minimum ${minGroupSize} guest(s) required`;
    if (formData.guests > maxGroupSize) newErrors.guests = `Maximum ${maxGroupSize} guests allowed`;
    if ((!formData.packageId || !formData.packageId) && (!formData.packageIds || formData.packageIds.length === 0)) newErrors.packageId = 'Package is required';

    // Validate booking date is not before the allowed minimum (admin minAdvanceDays)
    const selectedDate = new Date(formData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const earliest = new Date(today);
    earliest.setDate(earliest.getDate() + Number(minAdvanceDays || 0));
    if (formData.bookingDate && selectedDate < earliest) {
      newErrors.bookingDate = `Bookings must be made at least ${minAdvanceDays} day(s) in advance`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Require authentication before booking
    if (!isAuthenticated) {
      requireAuthRedirect(window.location.pathname + window.location.search);
      return;
    }

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    try {
      const guests = Number(formData.guests) || 1;

      if (Array.isArray(tourPackages) && tourPackages.length > 0) {
        // Send a single booking request containing multiple package IDs
        const payload = {
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          bookingDate: formData.bookingDate,
          guests: guests,
          specialRequests: formData.specialRequests,
          packageIds: tourPackages.map(p => p._id)
        };

        await createNewBooking(payload);
        showToast('Booking created successfully!', 'success');
        if (onSuccess) onSuccess();
      } else {
        // Single package booking
        const payload = {
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          bookingDate: formData.bookingDate,
          guests: formData.guests,
          specialRequests: formData.specialRequests,
          packageId: formData.packageId || (tourPackage && tourPackage._id) || ''
        };

        await createNewBooking(payload);
        showToast('Booking created successfully!', 'success');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      const msg = (error && (error.message || error.response?.data?.message || error.message)) || 'Failed to create booking';
      showToast(msg, 'error');
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + Number(minAdvanceDays || 0));
    return minDate.toISOString().split('T')[0];
  };

  if (!tourPackage) {
    if (!Array.isArray(tourPackages) || tourPackages.length === 0) {
      return (
        <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl">
          No package selected for booking
        </div>
      );
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full mx-auto relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
        <h2 className="text-2xl font-bold">Book Your Adventure</h2>
        <p className="text-white/90 text-sm mt-1">
          {Array.isArray(tourPackages) && tourPackages.length > 0
            ? `${tourPackages.length} packages selected`
            : tourPackage.title}
        </p>
        
        {/* outer modal already renders a close button; avoid duplicate here */}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium text-slate-700 flex items-center gap-2">
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
              className={`w-full px-4 py-2.5 rounded-xl border bg-white placeholder-slate-400 text-slate-800 ${errors.clientName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
            />
            {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="clientEmail" className="text-sm font-medium text-slate-700 flex items-center gap-2">
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
              className={`w-full px-4 py-2.5 rounded-xl border bg-white placeholder-slate-400 text-slate-800 ${errors.clientEmail ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
            />
            {errors.clientEmail && <p className="text-xs text-red-500 mt-1">{errors.clientEmail}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="clientPhone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
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
              className={`w-full px-4 py-2.5 rounded-xl border bg-white placeholder-slate-400 text-slate-800 ${errors.clientPhone ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
            />
            {errors.clientPhone && <p className="text-xs text-red-500 mt-1">{errors.clientPhone}</p>}
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <label htmlFor="guests" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Users size={16} className="text-primary-500" />
              Number of Guests *
            </label>
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.guests ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none bg-white text-slate-800 font-medium`}
            >
                {(() => {
                  const minG = Math.max(1, Number(minGroupSize || 1));
                  const maxG = Math.max(minG, Number(maxGroupSize || 15));
                  const opts = [];
                  for (let i = minG; i <= maxG; i++) opts.push(i);
                  return opts.map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ));
                })()}
            </select>
            {errors.guests ? (
              <p className="text-xs text-red-500 mt-1">{errors.guests}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Guests allowed: {minGroupSize}–{maxGroupSize}</p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label htmlFor="bookingDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
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
            className={`w-full px-4 py-2.5 rounded-xl border bg-white placeholder-slate-400 text-slate-800 ${errors.bookingDate ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-primary-200'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
          />
          {errors.bookingDate && <p className="text-xs text-red-500 mt-1">{errors.bookingDate}</p>}
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <label htmlFor="specialRequests" className="text-sm font-medium text-slate-700 flex items-center gap-2">
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
            className="w-full px-4 py-2.5 rounded-xl border bg-white placeholder-slate-400 text-slate-800 border-slate-200 focus:ring-primary-200 focus:border-primary-500 focus:ring-4 transition-all outline-none resize-none"
          />
        </div>

        {/* Price Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Price Summary</h3>
          {Array.isArray(tourPackages) && tourPackages.length > 0 ? (
            <div className="space-y-2">
              {tourPackages.map(p => (
                <div key={p._id} className="flex justify-between items-center text-sm text-slate-600">
                  <span className="truncate">{p.title} × {formData.guests}</span>
                  <span>{formatPrice(p.price)} × {formData.guests}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total Days:</span>
                <span className="text-slate-900 font-medium">{tourPackages.reduce((a,p) => a + (p.duration||0),0)} Day{tourPackages.reduce((a,p) => a + (p.duration||0),0) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
              <span>{tourPackage.title} × {formData.guests}</span>
              <span>{formatPrice(tourPackage.price)} × {formData.guests}</span>
            </div>
          )}
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
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-primary-700 hover:to-blue-700 shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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