// src/components/booking/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { useBooking } from '../../../../context/BookingContext';
import { useToast } from '../../../../context/ToastContext';
import Loader from "../../components/ui/Loader";
import './BookingForm.css';

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
      <div className="booking-form">
        <div className="error-message">No package selected for booking</div>
      </div>
    );
  }

  return (
    <div className={`booking-form ${loading ? 'loading' : ''}`}>
      <h2>Book {tourPackage.title}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="clientName">Full Name *</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            {errors.clientName && <div className="error-message">{errors.clientName}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="clientEmail">Email *</label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.clientEmail && <div className="error-message">{errors.clientEmail}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="clientPhone">Phone *</label>
            <input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
            {errors.clientPhone && <div className="error-message">{errors.clientPhone}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="guests">Number of Guests *</label>
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            {errors.guests && <div className="error-message">{errors.guests}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bookingDate">Booking Date *</label>
          <input
            type="date"
            id="bookingDate"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            min={getMinDate()}
          />
          {errors.bookingDate && <div className="error-message">{errors.bookingDate}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="specialRequests">Special Requests</label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requirements or requests..."
          />
        </div>

        {/* Price Summary */}
        <div className="price-summary">
          <h3>Price Summary</h3>
          <div className="price-item">
            <span>{tourPackage.title} × {formData.guests}</span>
            <span>${tourPackage.price} × {formData.guests}</span>
          </div>
          <div className="price-total">
            <span>Total Amount:</span>
            <span>${calculatedPrice}</span>
          </div>
        </div>

        <div className="form-row">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              style={{
                flex: 1,
                padding: '1rem',
                background: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? <Loader size="small" /> : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;