// src/pages/user/Bookings.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';
import * as bookingService from '../../services/bookingService';
import { AuthContext } from "../../context/AuthContext";
import BookingFilters from '../../components/user/bookings/BookingFilters';
import BookingList from '../../components/user/bookings/BookingList';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import BookingDetailsModal from '../../components/user/bookings/BookingDetailsModal';
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
  const [refundEstimate, setRefundEstimate] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  

  // Load appropriate bookings based on view
  useEffect(() => {
    if (view === 'all' && isAdmin) {
      fetchBookings();
    } else {
      fetchMyBookings(filters);
    }
  }, [view, isAdmin, fetchBookings, fetchMyBookings]);

  // Refetch when filters change
  useEffect(() => {
    if (view === 'all' && isAdmin) {
      fetchBookings(filters);
    } else {
      fetchMyBookings(filters);
    }
  }, [filters, view, isAdmin, fetchBookings, fetchMyBookings]);

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

  // bookingObj: full booking object from BookingCard
  const handleCancelClick = (bookingObj) => {
    setBookingToCancel(bookingObj);
    setCancelModalOpen(true);
    setRefundEstimate(null);
    // Fetch server estimate (non-blocking)
    (async () => {
      try {
        const res = await bookingService.getRefundEstimate(bookingObj._id);
        setRefundEstimate(res.data);
      } catch (err) {
        console.error('Failed to fetch refund estimate:', err);
        setRefundEstimate(null);
      }
    })();
  };

  const handleViewDetails = (bookingObj) => {
    setSelectedBooking(bookingObj);
    setDetailsModalOpen(true);
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
        await cancelBooking(bookingToCancel._id || bookingToCancel);
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

      <div className="space-y-6">
        {/* Top Filters */}
        <div>
          <BookingFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
            isAdmin={isAdmin && view === 'all'}
          />
        </div>

        {/* Main Content */}
        <main className="space-y-6">
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
              <div className="p-3 bg-blue-50 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
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
            onViewDetails={handleViewDetails}
            isAdmin={isAdmin && view === 'all'}
          />
        </main>
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedBooking(null); }}
      />

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
        onClose={() => { setCancelModalOpen(false); setRefundEstimate(null); }}
        onConfirm={confirmCancel}
        title="Cancel Booking"
        message={(() => {
          if (!bookingToCancel) return 'Are you sure you want to cancel this booking? Cancellation fees may apply.';

          // If booking is not confirmed, explicitly tell the user there is no refund eligibility.
          if (bookingToCancel.status !== 'confirmed') {
            return (
              <div className="text-left">
                <p className="mb-2">Are you sure you want to cancel this booking?</p>
                <div className="bg-gray-50 p-3 rounded mb-2">
                  <p className="text-sm text-gray-600">Booking: <strong>{(bookingToCancel.packages && bookingToCancel.packages.length > 0) ? bookingToCancel.packages.map(p => p.title).join(', ') : (bookingToCancel.package?.title || bookingToCancel.destinationName || 'Selected package')}</strong></p>
                  <p className="text-sm text-gray-600">Date: <strong>{new Date(bookingToCancel.bookingDate || bookingToCancel.createdAt).toLocaleDateString()}</strong></p>
                  <p className="text-sm text-gray-600">Guests: <strong>{bookingToCancel.guests || 1}</strong></p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-700">This booking is not confirmed. Cancelling will not be eligible for a refund.</p>
                  <p className="text-xs text-gray-500 mt-2">If you need assistance, contact support or an administrator.</p>
                </div>
              </div>
            );
          }

          const estimate = refundEstimate;

          if (!estimate) {
            // fallback to client-side computation like before while server responds
            const now = new Date();
            const tourDate = new Date(bookingToCancel.bookingDate || bookingToCancel.createdAt);
            const daysUntil = Math.ceil((tourDate - now) / (1000 * 60 * 60 * 24));
            let refundAmount = 0;
            let refundPercentage = 0;
            const total = bookingToCancel.totalPrice || bookingToCancel.totalAmount || 0;

            if (daysUntil >= 14) {
              refundAmount = total;
              refundPercentage = 100;
            } else if (daysUntil >= 7) {
              refundAmount = Math.floor(total * 0.5);
              refundPercentage = 50;
            } else {
              refundAmount = 0;
              refundPercentage = 0;
            }

            return (
              <div className="text-left">
                <p className="mb-2">Are you sure you want to cancel this booking?</p>
                <div className="bg-gray-50 p-3 rounded mb-2">
                  <p className="text-sm text-gray-600">Booking: <strong>{(bookingToCancel.packages && bookingToCancel.packages.length > 0) ? bookingToCancel.packages.map(p => p.title).join(', ') : (bookingToCancel.package?.title || bookingToCancel.destinationName || 'Selected package')}</strong></p>
                  <p className="text-sm text-gray-600">Date: <strong>{new Date(bookingToCancel.bookingDate || bookingToCancel.createdAt).toLocaleDateString()}</strong></p>
                  <p className="text-sm text-gray-600">Guests: <strong>{bookingToCancel.guests || 1}</strong></p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-700">Estimated Refund: <strong>₱{(refundAmount || 0).toLocaleString()}</strong> ({refundPercentage}%)</p>
                  <p className="text-xs text-gray-500 mt-2">Refund policy: Full refund if cancelled ≥14 days before; 50% if 7–13 days; no refund if &lt;7 days.</p>
                </div>
              </div>
            );
          }

          // Server-provided estimate
          return (
            <div className="text-left">
              <p className="mb-2">Are you sure you want to cancel this booking?</p>
              <div className="bg-gray-50 p-3 rounded mb-2">
                <p className="text-sm text-gray-600">Booking: <strong>{estimate.packageTitle || ((bookingToCancel.packages && bookingToCancel.packages.length > 0) ? bookingToCancel.packages.map(p => p.title).join(', ') : (bookingToCancel.package?.title || 'Selected package'))}</strong></p>
                <p className="text-sm text-gray-600">Date: <strong>{new Date(estimate.bookingDate || bookingToCancel.bookingDate || bookingToCancel.createdAt).toLocaleDateString()}</strong></p>
                <p className="text-sm text-gray-600">Guests: <strong>{bookingToCancel.guests || 1}</strong></p>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-700">Estimated Refund: <strong>₱{(estimate.refundAmount || 0).toLocaleString()}</strong> ({estimate.refundPercentage}%)</p>
                <p className="text-xs text-gray-500 mt-2">Refund policy: Full refund if cancelled ≥14 days before; 50% if 7–13 days; no refund if &lt;7 days.</p>
                <p className="text-xs text-gray-500 mt-1">This estimate comes from the server and is authoritative.</p>
              </div>
            </div>
          );
        })()}
        confirmText="Cancel Booking"
        type="warning"
      />

      {/* Rebook flow removed — UI for duplicating bookings has been disabled */}
    </div>
  );
};

export default Bookings;