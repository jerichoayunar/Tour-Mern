// src/pages/admin/ManageBookings.jsx - UPDATED FOR BACKEND COMPATIBILITY
import React, { useState, useEffect, useCallback } from "react"; // 🛠️ ADD: useCallback
import { 
  getBookings, 
  updateBookingStatus,
  archiveBooking,
  restoreBooking,
  deleteBookingPermanent
} from "../../services/bookingService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import BookingFilters from "../../components/admin/bookings/BookingFilters";
import BookingsTable from "../../components/admin/bookings/BookingsTable";
import BookingDetailsModal from "../../components/admin/bookings/BookingDetailsModal";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";

const ManageBookings = () => {
  const [allBookings, setAllBookings] = useState([]); // All bookings from API
  const [filteredBookings, setFilteredBookings] = useState([]); // Bookings after filtering
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false); // 📦 ARCHIVE STATE
  const [filters, setFilters] = useState({ 
    search: "", 
    status: "", 
    startDate: "", 
    endDate: "",
    guests: "",
    minAmount: "",
    maxAmount: ""
  });

  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  // ============================================================================
  // 🎯 CHECK FOR ACTIVE FILTERS
  // ============================================================================
  const hasActiveFilters = Object.values(filters).some(
    value => value !== "" && value !== null && value !== undefined
  );

  // ============================================================================
  // 🎯 UPDATED BOOKING STATISTICS - USING CORRECT BACKEND FIELD NAMES
  // ============================================================================
  const bookingStats = {
    total: allBookings.length,
    pending: allBookings.filter(b => b.status === 'pending').length,
    confirmed: allBookings.filter(b => b.status === 'confirmed').length,
    cancelled: allBookings.filter(b => b.status === 'cancelled').length,
    // 🛠️ FIX: Use 'totalPrice' from backend instead of 'totalAmount'
    revenue: allBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0) // 🛠️ FIX: booking.totalPrice
  };

  // ============================================================================
  // 🎯 FETCH BOOKINGS FROM API
  // ============================================================================
  const fetchBookings = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log(`🔄 Fetching ${showArchived ? 'archived' : 'active'} bookings`);
      // Pass archived flag to API
      const response = await getBookings({ onlyArchived: showArchived }); 
      
      if (response && response.success) {
        setAllBookings(response.data || []);
        console.log('✅ Bookings loaded:', response.data?.length || 0);
      } else {
        throw new Error(response?.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('❌ Bookings error:', error);
      showToast(error.message || "Failed to load bookings", "error");
      setAllBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================================
  // 🎯 UPDATED APPLY FILTERS - USING CORRECT BACKEND FIELD NAMES
  // ============================================================================
  const applyFilters = useCallback(() => { // 🛠️ FIX: Wrap in useCallback
    let filtered = [...allBookings];

    // Apply search filter with correct backend field names
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(booking => {
        // 🛠️ FIX: Use direct backend fields (clientName, clientEmail) not nested user object
        const clientName = (booking.clientName || "").toLowerCase(); // 🛠️ FIX: booking.clientName
        const clientEmail = (booking.clientEmail || "").toLowerCase(); // 🛠️ FIX: booking.clientEmail
        const packageName = (booking.package?.title || "").toLowerCase(); // 🛠️ FIX: package.title
        
        return (
          clientName.includes(searchTerm) ||
          clientEmail.includes(searchTerm) ||
          packageName.includes(searchTerm)
        );
      });
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.bookingDate || booking.createdAt);
        const startDate = new Date(filters.startDate);
        return bookingDate >= startDate;
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.bookingDate || booking.createdAt);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Include entire end day
        return bookingDate <= endDate;
      });
    }

    // Apply guest count filter
    if (filters.guests) {
      filtered = filtered.filter(booking => 
        (booking.guests || 0) >= parseInt(filters.guests) // 🛠️ FIX: Remove numberOfGuests fallback
      );
    }

    // Apply amount filters with correct backend field name
    if (filters.minAmount) {
      filtered = filtered.filter(booking => 
        (booking.totalPrice || 0) >= parseFloat(filters.minAmount) // 🛠️ FIX: booking.totalPrice
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(booking => 
        (booking.totalPrice || 0) <= parseFloat(filters.maxAmount) // 🛠️ FIX: booking.totalPrice
      );
    }

    setFilteredBookings(filtered);
    console.log('🔍 Filtered results:', filtered.length, 'of', allBookings.length);
  }, [filters, allBookings]); // 🛠️ FIX: Proper dependencies

  // ============================================================================
  // 🎯 USE EFFECT HOOKS - WITH PROPER DEPENDENCIES
  // ============================================================================
  
  // Apply filters when filters or allBookings change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // 🛠️ FIX: Only depend on applyFilters (which has filters/allBookings as deps)

  // Load all bookings on component mount or when archive mode changes
  useEffect(() => {
    fetchBookings();
  }, [showArchived]); // 🛠️ FIX: Re-fetch when showArchived changes

  // ============================================================================
  // 🎯 EVENT HANDLERS
  // ============================================================================
  
  // Manual refresh
  const handleRefresh = () => {
    fetchBookings(true);
  };

  // Archive Booking
  const handleArchive = async (booking) => {
    if (!window.confirm(`Are you sure you want to archive the booking for ${booking.clientName || 'this client'}?`)) {
      return;
    }

    try {
      const response = await archiveBooking(booking._id);
      if (response.success) {
        showToast("Booking archived successfully", "success");
        fetchBookings(true);
      }
    } catch (error) {
      showToast(error.message || "Failed to archive booking", "error");
    }
  };

  // Restore Booking
  const handleRestore = async (booking) => {
    try {
      const response = await restoreBooking(booking._id);
      if (response.success) {
        showToast("Booking restored successfully", "success");
        fetchBookings(true);
      }
    } catch (error) {
      showToast(error.message || "Failed to restore booking", "error");
    }
  };

  // Permanent Delete
  const handleDeletePermanent = async (booking) => {
    if (!window.confirm(`⚠️ WARNING: This will PERMANENTLY delete the booking for ${booking.clientName || 'this client'}. This action CANNOT be undone. Are you sure?`)) {
      return;
    }

    try {
      const response = await deleteBookingPermanent(booking._id);
      if (response.success) {
        showToast("Booking permanently deleted", "success");
        fetchBookings(true);
      }
    } catch (error) {
      showToast(error.message || "Failed to delete booking", "error");
    }
  };

  // Enhanced status update with optimistic UI
  const handleStatusUpdate = async (bookingId, status) => {
    const originalAllBookings = [...allBookings];
    const originalFilteredBookings = [...filteredBookings];
    
    // Optimistic update
    setAllBookings(prev => prev.map(booking =>
      booking._id === bookingId ? { ...booking, status, updating: true } : booking
    ));

    try {
      console.log('🔄 Updating booking status:', { bookingId, status });
      const response = await updateBookingStatus(bookingId, status);
      
      if (response && response.success) {
        showToast(`Booking status updated to ${status}`, "success");
        
        // Refresh all bookings to get latest data
        fetchBookings(true);
        
        // Update selected booking if modal is open
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status });
        }
      } else {
        throw new Error(response?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Status update error:', error);
      showToast(error.message || "Error updating booking status", "error");
      
      // Revert optimistic update
      setAllBookings(originalAllBookings);
      setFilteredBookings(originalFilteredBookings);
    }
  };

  // Modal handlers
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Filter handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "", 
      status: "", 
      startDate: "", 
      endDate: "",
      guests: "",
      minAmount: "",
      maxAmount: ""
    });
  };

  // Export functionality
  const handleExport = () => {
    // Implement CSV export
    showToast("Export feature coming soon!", "info");
  };

  // ============================================================================
  // 🎯 COMPONENT RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Bookings</h1>
            <p className="text-gray-600">
              View, manage, and update all tour bookings in one place
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant={showArchived ? "primary" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center space-x-2"
            >
              <span>{showArchived ? '📂' : '📦'}</span>
              <span>{showArchived ? 'View Active' : 'View Archived'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Export</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <span>{refreshing ? '🔄' : '🔃'}</span>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards - Show ALL bookings stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookingStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                {/* 🛠️ FIX: Revenue calculation now uses correct totalPrice field */}
                <p className="text-2xl font-bold text-purple-600">
                  ₱{bookingStats.revenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">💰</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <BookingFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Results Info */}
      {!loading && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredBookings.length} of {allBookings.length} bookings
          {hasActiveFilters && " (filtered)"}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader size="large" />
          <p className="text-gray-600 mt-4">Loading bookings...</p>
        </div>
      ) : (
        <>
          {/* Bookings Table - Only show if there are FILTERED bookings */}
          {filteredBookings.length > 0 ? (
            <BookingsTable
              bookings={filteredBookings}
              onViewDetails={handleViewDetails}
              onStatusUpdate={handleStatusUpdate}
              isArchived={showArchived}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDeletePermanent={handleDeletePermanent}
            />
          ) : (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">
                {showArchived ? '📦' : '📋'}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasActiveFilters 
                  ? "No matching bookings found" 
                  : (showArchived ? "No archived bookings" : "No bookings yet")
                }
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? "No bookings match your current filters. Try adjusting your search criteria."
                  : (showArchived 
                      ? "Archived bookings will appear here." 
                      : "No bookings have been created yet. Bookings will appear here once customers make reservations.")
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={handleResetFilters} variant="primary">
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
        isOpen={isModalOpen}
        
      />

      {/* Refreshing Overlay */}
      {refreshing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <span>🔄</span>
          <span>Updating...</span>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;