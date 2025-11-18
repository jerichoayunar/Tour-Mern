// src/components/bookings/BookingList.jsx
import React from 'react';
import BookingCard from './BookingCard';
import Loader from "../../../components/ui/Loader";
import './BookingList.css';

const BookingList = ({ 
  bookings, 
  loading, 
  error, 
  onStatusUpdate, 
  onDelete, 
  isAdmin = false 
}) => {
  if (loading) {
    return (
      <div className="booking-list-loading">
        <Loader />
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-list-error">
        <p>Error: {error}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="booking-list-empty">
        <p>No bookings found.</p>
        <p>Try adjusting your filters or create a new booking.</p>
      </div>
    );
  }

  return (
    <div className="booking-list">
      {bookings.map((booking) => (
        <BookingCard
          key={booking._id}
          booking={booking}
          onStatusUpdate={onStatusUpdate}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default BookingList;