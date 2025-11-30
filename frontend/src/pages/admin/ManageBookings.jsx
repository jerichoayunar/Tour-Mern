// src/pages/admin/ManageBookings.jsx - REFACTORED UI
import React, { useState, useEffect, useCallback } from "react";
import { 
  getBookings, 
  updateBookingStatus,
  archiveBooking,
  restoreBooking,
  deleteBookingPermanent
} from "../../services/bookingService";
import adminService from '../../services/adminService';
import { useToast } from "../../context/ToastContext";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useAuth } from "../../context/AuthContext";
import BookingFilters from "../../components/admin/bookings/BookingFilters";
import BookingsTable from "../../components/admin/bookings/BookingsTable";
import BookingDetailsModal from "../../components/admin/bookings/BookingDetailsModal";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card"; // ✅ Import Card
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download, 
  Archive, 
  FolderOpen 
} from "lucide-react"; // ✅ Import Icons

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
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null
  });
  const { isAdmin: _isAdmin } = useAuth();

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
    cancellationRequested: allBookings.filter(b => b.cancellation?.requested).length,
    // 🛠️ FIX: Use 'totalPrice' from backend instead of 'totalAmount'
    revenue: allBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0) // 🛠️ FIX: booking.totalPrice
  };

  // ============================================================================
  // 🎯 FETCH BOOKINGS FROM API
  // ============================================================================
  const fetchBookings = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log(`🔄 Fetching ${showArchived ? 'archived' : 'active'} bookings`);
      // Pass archived flag to API
      const response = await getBookings({ onlyArchived: showArchived }); 

      // Normalize service response: prefer axios-style payload, then canonical {success,data}, then raw array
      const resp = response?.data ?? response;

      if (resp && typeof resp === 'object' && resp.success !== undefined) {
        if (resp.success) {
          const bookingsArray = Array.isArray(resp.data) ? resp.data : (Array.isArray(resp.bookings) ? resp.bookings : []);
          setAllBookings(bookingsArray);
          console.log('✅ Bookings loaded:', bookingsArray.length);
        } else {
          throw new Error(resp.message || 'Failed to load bookings');
        }
      } else {
        // Otherwise assume resp is the bookings array or contains an array in .data
        const bookingsArray = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
        setAllBookings(bookingsArray);
        console.log('✅ Bookings loaded:', bookingsArray.length);
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
  }, [showArchived, showToast]);

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
        const packageName = (booking.packages && booking.packages.length > 0)
          ? booking.packages.map(p => p.title).join(', ').toLowerCase()
          : (booking.package?.title || "").toLowerCase();
        
        return (
          clientName.includes(searchTerm) ||
          clientEmail.includes(searchTerm) ||
          packageName.includes(searchTerm)
        );
      });
    }

    // Apply status filter
    if (filters.status) {
      // Special case: 'requested' refers to cancellation requests, not booking.status
      if (filters.status === 'requested') {
        filtered = filtered.filter(booking => booking.cancellation?.requested === true);
      } else {
        filtered = filtered.filter(booking => booking.status === filters.status);
      }
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
  }, [fetchBookings]);

  // ============================================================================
  // 🎯 EVENT HANDLERS
  // ============================================================================
  
  // Manual refresh
  const handleRefresh = () => {
    fetchBookings(true);
  };

  // Archive Booking
  const handleArchive = async (booking) => {
    setConfirmationModal({
      isOpen: true,
      type: 'warning',
      title: 'Archive Booking',
      message: `Are you sure you want to archive the booking for ${booking.clientName || 'this client'}?`,
      confirmText: 'Archive',
      onConfirm: async () => {
        try {
          const response = await archiveBooking(booking._id);
          if (response && response.success) {
            showToast("Booking archived successfully", "success");
            fetchBookings(true);
          }
        } catch (error) {
          showToast(error.message || "Failed to archive booking", "error");
        }
      }
    });
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
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Permanently Delete Booking',
      message: `⚠️ WARNING: This will PERMANENTLY delete the booking for ${booking.clientName || 'this client'}. This action CANNOT be undone. Continue?`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await deleteBookingPermanent(booking._id);
          if (response && response.success) {
            showToast("Booking permanently deleted", "success");
            fetchBookings(true);
          }
        } catch (error) {
          showToast(error.message || "Failed to delete booking", "error");
        }
      }
    });
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
    try {
      showToast('Preparing export...', 'info');

      const currencyFmt = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

      const exportId = 'BKEXP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();

      const rows = [];
      const headers = [
        'Export Reference',
        'Booking ID',
        'Client Name',
        'Client Email',
        'Client Phone',
        'Packages',
        'Package Prices',
        'Package Destinations',
        'Total Days',
        'Booking Date (Local)',
        'Booking Date (ISO)',
        'Guests',
        'Total Price (PHP)',
        'Status',
        'Cancellation Requested',
        'Special Requests',
        'Created At (Local)',
        'Created At (ISO)'
      ];

      rows.push(headers);

      const dataToExport = Array.isArray(filteredBookings) ? filteredBookings : [];

      dataToExport.forEach(b => {
        // Package details (support populated package objects or minimal package refs)
        const packagesArr = Array.isArray(b.packages) && b.packages.length > 0 ? b.packages : (b.package ? [b.package] : []);

        const packageTitles = packagesArr.map(p => (p && (p.title || p.name)) || '').filter(Boolean).join('; ');
        const packagePrices = packagesArr.map(p => {
          const price = p?.price ?? p?.amount ?? '';
          return price !== '' ? currencyFmt.format(Number(price)) : '';
        }).filter(Boolean).join('; ');
        const packageDestinations = packagesArr.map(p => (p && (p.destination || p.destinationName || '')) || '').filter(Boolean).join('; ');

        const totalDays = b.totalDays ?? (packagesArr.length > 0 ? packagesArr.reduce((a, p) => a + (p?.duration || 0), 0) : (b.package?.duration || ''));

        const bookingDateIso = b.bookingDate ? new Date(b.bookingDate).toISOString() : '';
        const bookingDateLocal = b.bookingDate ? new Date(b.bookingDate).toLocaleString() : '';

        const createdAtIso = b.createdAt ? new Date(b.createdAt).toISOString() : '';
        const createdAtLocal = b.createdAt ? new Date(b.createdAt).toLocaleString() : '';

        const totalPriceVal = Number(b.totalPrice ?? b.totalAmount ?? 0) || 0;

        const row = [
          exportId,
          b._id || '',
          b.clientName || b.user?.name || '',
          b.clientEmail || b.user?.email || '',
          b.clientPhone || b.phone || b.user?.phone || '',
          packageTitles,
          packagePrices,
          packageDestinations,
          String(totalDays),
          bookingDateLocal,
          bookingDateIso,
          String(b.guests ?? ''),
          currencyFmt.format(totalPriceVal),
          (b.status || ''),
          (b.cancellation?.requested ? 'Yes' : 'No'),
          (b.specialRequests || ''),
          createdAtLocal,
          createdAtIso
        ];

        rows.push(row);
      });

      const escapeCsv = v => '"' + String(v).replace(/"/g, '""') + '"';
      const csv = rows.map(r => r.map(escapeCsv).join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_export_${exportId}_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Export downloaded', 'success');
    } catch (error) {
      console.error('Export failed', error);
      showToast(error?.message || 'Export failed', 'error');
    }
  };

  // ============================================================================
  // 🎯 COMPONENT RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-platinum p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Bookings</h1>
            <p className="text-slate-500">
              View, manage, and update all tour bookings in one place
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              {refreshing ? <Loader size="sm" /> : <RefreshCw className="w-4 h-4" />}
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Archive Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant={showArchived ? "primary" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center space-x-2"
          >
            {showArchived ? <FolderOpen className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            <span>{showArchived ? 'View Active' : 'View Archived'}</span>
          </Button>
        </div>

        {/* Statistics Cards - Show ALL bookings stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{bookingStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                <Package className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{bookingStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                <Clock className="text-amber-600 w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Confirmed</p>
                <p className="text-2xl font-bold text-emerald-600">{bookingStats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                <CheckCircle className="text-emerald-600 w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                {/* 🛠️ FIX: Revenue calculation now uses correct totalPrice field */}
                <p className="text-2xl font-bold text-purple-600">
                  ₱{bookingStats.revenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                <span className="text-purple-600 font-bold text-lg">₱</span>
              </div>
            </div>
          </Card>
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
        <div className="mb-4 text-sm text-slate-600">
          Showing {filteredBookings.length} of {allBookings.length} bookings
          {hasActiveFilters && " (filtered)"}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <Card className="p-12 text-center">
          <Loader size="lg" />
          <p className="text-slate-500 mt-4">Loading bookings...</p>
        </Card>
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
            <Card className="p-12 text-center">
              <div className="text-slate-300 text-6xl mb-4">
                {showArchived ? '📦' : '📋'}
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {hasActiveFilters 
                  ? "No matching bookings found" 
                  : (showArchived ? "No archived bookings" : "No bookings yet")
                }
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
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
            </Card>
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

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
      />

      {/* Refreshing Overlay */}
      {refreshing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <Loader size="sm" />
          <span>Updating...</span>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;