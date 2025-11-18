// src/components/bookings/BookingCard.jsx
import React from 'react';
import './BookingCard.css';

const BookingCard = ({ booking, onStatusUpdate, onDelete, isAdmin = false }) => {
  const {
    _id,
    package: tourPackage,
    clientName,
    clientEmail,
    clientPhone,
    bookingDate,
    guests,
    totalPrice,
    status,
    specialRequests,
    createdAt
  } = booking;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className={`booking-card ${getStatusBadgeClass(status)}`}>
      <div className="booking-header">
        <h3 className="booking-title">
          {tourPackage?.title || 'Package Not Available'}
        </h3>
        <span className={`status-badge ${getStatusBadgeClass(status)}`}>
          {status}
        </span>
      </div>

      <div className="booking-details">
        <div className="detail-row">
          <span className="detail-label">Booking Date:</span>
          <span className="detail-value">{formatDate(bookingDate)}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Guests:</span>
          <span className="detail-value">{guests} person(s)</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Total Price:</span>
          <span className="detail-value price">${totalPrice}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Client:</span>
          <span className="detail-value">{clientName}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{clientEmail}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">{clientPhone}</span>
        </div>

        {specialRequests && (
          <div className="detail-row full-width">
            <span className="detail-label">Special Requests:</span>
            <span className="detail-value requests">{specialRequests}</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Booked On:</span>
          <span className="detail-value">{formatDate(createdAt)}</span>
        </div>
      </div>

      <div className="booking-actions">
        {isAdmin && (
          <div className="admin-actions">
            <select 
              value={status}
              onChange={(e) => onStatusUpdate(_id, e.target.value)}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
        
        <button 
          className="btn-delete"
          onClick={() => onDelete(_id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BookingCard;