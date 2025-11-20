// src/pages/user/Bookings.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { AuthContext } from "../../context/AuthContext";
import BookingFilters from '../../components/user/bookings/BookingFilters';
import BookingList from '../../components/user/bookings/BookingList';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { LayoutDashboard, CheckCircle, Clock } from 'lucide-react';

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
    cancelBooking,
    updateFilters,
    clearFilters
  } = useBookings();

  const [view, setView] = useState(isAdmin ? 'all' : 'my');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

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

  const handleDeleteClick = (bookingId) => {
    setBookingToDelete(bookingId);
    setDeleteModalOpen(true);
  };

  const handleCancelClick = (bookingId) => {
    setBookingToCancel(bookingId);
    setCancelModalOpen(true);
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      try {
        await deleteBooking(bookingToDelete);
        setBookingToDelete(null);
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
  };

  const confirmCancel = async () => {
    if (bookingToCancel) {
      try {
        await cancelBooking(bookingToCancel);
        setBookingToCancel(null);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    clearFilters(); // Clear filters when switching views
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
          <p className="text-gray-600">Manage your tour bookings and reservations</p>
        </div>
        
        {isAdmin && (
          <div className="bg-gray-100 p-1 rounded-xl flex items-center">
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === 'my' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleViewChange('my')}
            >
              My Bookings
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === 'all' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleViewChange('all')}
            >
              All Bookings
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-1/4 space-y-6">
          <BookingFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
            isAdmin={isAdmin && view === 'all'}
          />
        </aside>

        {/* Main Content */}
        <main className="lg:w-3/4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <LayoutDashboard className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                <div className="text-sm text-gray-500">Total Bookings</div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </div>
                <div className="text-sm text-gray-500">Confirmed</div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-full">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>

          <BookingList
            bookings={bookings}
            loading={loading}
            error={error}
            onStatusUpdate={isAdmin ? handleStatusUpdate : null}
            onDelete={handleDeleteClick}
            onCancel={handleCancelClick}
            isAdmin={isAdmin && view === 'all'}
          />
        </main>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        confirmText="Delete Booking"
        type="danger"
      />

      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? Cancellation fees may apply."
        confirmText="Cancel Booking"
        type="warning"
      />
    </div>
  );
};

export default Bookings;