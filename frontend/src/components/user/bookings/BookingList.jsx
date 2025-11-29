// src/components/user/bookings/BookingList.jsx
import React from 'react';
import { Frown, CalendarX } from 'lucide-react';
import BookingCard from './BookingCard';
import Loader from "../../../components/ui/Loader";

const BookingList = ({ 
  bookings, 
  loading, 
  error, 
  onStatusUpdate, 
  onDelete, 
  onCancel, // Add onCancel prop
  onViewDetails, // new prop to view booking details
  isAdmin = false 
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader size="lg" />
        <p className="text-gray-500 font-medium animate-pulse">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200/60 max-w-2xl mx-auto">
        <div className="text-rose-400 mb-6">
          <Frown size={60} className="mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Unable to Load Bookings
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200/60">
        <div className="text-gray-300 mb-6">
          <CalendarX size={60} className="mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          No Bookings Found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {isAdmin 
            ? "No bookings match the current filters." 
            : "You haven't made any bookings yet. Start exploring our packages!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="list" aria-label="Bookings list">
      {bookings.map((booking) => (
        <div key={booking._id} className="animate-fade-in" role="listitem">
          <BookingCard
            booking={booking}
            onStatusUpdate={onStatusUpdate}
            onDelete={onDelete}
            onCancel={onCancel} // Pass onCancel prop
            onViewDetails={onViewDetails}
            isAdmin={isAdmin}
          />
        </div>
      ))}
    </div>
  );
};

export default BookingList;