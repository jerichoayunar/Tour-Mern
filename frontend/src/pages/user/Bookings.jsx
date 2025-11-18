// src/pages/Bookings.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { AuthContext } from "../../context/AuthContext";
import BookingFilters from '../../components/user/bookings/BookingFilters';
import BookingList from '../../components/user/bookings/BookingList';
import './Bookings.css';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  
  const {
    bookings,
    loading,
    error,
    filters,
    fetchBookings,
    fetchMyBookings,
    updateBookingStatus,
    deleteBooking,
    updateFilters,
    clearFilters
  } = useBookings();

  const [view, setView] = useState(isAdmin ? 'all' : 'my');

  // Load appropriate bookings based on view
  useEffect(() => {
    if (view === 'all' && isAdmin) {
      fetchBookings();
    } else {
      fetchMyBookings();
    }
  }, [view, isAdmin]);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      // Refresh the current view
      if (view === 'all') {
        await fetchBookings();
      } else {
        await fetchMyBookings();
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(bookingId);
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    clearFilters(); // Clear filters when switching views
  };

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h1>Bookings Management</h1>
        <p>Manage your tour bookings and reservations</p>
        
        {isAdmin && (
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${view === 'my' ? 'active' : ''}`}
              onClick={() => handleViewChange('my')}
            >
              My Bookings
            </button>
            <button 
              className={`toggle-btn ${view === 'all' ? 'active' : ''}`}
              onClick={() => handleViewChange('all')}
            >
              All Bookings
            </button>
          </div>
        )}
      </div>

      <div className="bookings-content">
        <aside className="bookings-sidebar">
          <BookingFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
            isAdmin={isAdmin && view === 'all'}
          />
        </aside>

        <main className="bookings-main">
          <div className="bookings-stats">
            <div className="stat-card">
              <span className="stat-number">{bookings.length}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {bookings.filter(b => b.status === 'confirmed').length}
              </span>
              <span className="stat-label">Confirmed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
          </div>

          <BookingList
            bookings={bookings}
            loading={loading}
            error={error}
            onStatusUpdate={isAdmin ? handleStatusUpdate : null}
            onDelete={handleDeleteBooking}
            isAdmin={isAdmin && view === 'all'}
          />
        </main>
      </div>
    </div>
  );
};

export default Bookings;