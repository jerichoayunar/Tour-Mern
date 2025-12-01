// src/components/admin/bookings/BookingDetailsModal.jsx - FIXED HOOK ORDER
import React, { useState, useMemo, useEffect } from "react";
import Button from "../../ui/Button";
import BookingStatusBadge from "./BookingStatusBadge";
import * as bookingService from '../../../services/bookingService';
import { useToast } from '../../../context/ToastContext';
import { useBooking } from '../../../context/BookingContext';

const BookingDetailsModal = ({ booking, onClose, onStatusUpdate, isOpen }) => {
  // ============================================================================
  // 🎯 HOOKS MUST BE CALLED UNCONDITIONALLY - FIXED ORDER
  // ============================================================================
  const [activeTab, setActiveTab] = useState("details");
  const [adminNotes, setAdminNotes] = useState("");
  const [_savingNotes, setSavingNotes] = useState(false);
  const { showToast } = useToast();
  const { updateBookingLocal } = useBooking();

  // Initialize adminNotes when booking changes
  useEffect(() => {
    setAdminNotes(booking?.adminNotes || "");
  }, [booking]);

  // ============================================================================
  // 🎯 MEMOIZED DATA FOR PERFORMANCE - MUST BE CALLED UNCONDITIONALLY
  // ============================================================================
  const formattedData = useMemo(() => {
    if (!booking) {
      // Return empty data if no booking
      return {
        clientName: 'N/A',
        clientEmail: 'N/A', 
        clientPhone: 'Not provided',
        packageName: 'N/A',
        packagePrice: 0,
        packageDuration: 'N/A',
        bookingDate: new Date(),
        totalAmount: 0,
        guests: 1
      };
    }

    // 🛠️ FIX: Use correct backend fields
    const clientName = booking.clientName || booking.user?.name || booking.client?.name || 'N/A';
    const clientEmail = booking.clientEmail || booking.user?.email || booking.client?.email || 'N/A';
    const clientPhone = booking.clientPhone || booking.user?.phone || booking.client?.phone || booking.phone || 'Not provided';
    
    // Support multi-package bookings
    const packageInfo = booking.package || {};
    const packagesArr = booking.packages || [];
    const packageName = packagesArr && packagesArr.length > 0
      ? packagesArr.map(p => p.title).join(', ')
      : (packageInfo.title || packageInfo.name || 'N/A');
    const packagePrice = packagesArr && packagesArr.length > 0
      ? packagesArr.reduce((a,p) => a + (p.price || 0), 0)
      : (packageInfo.price || 0);
    const packageDuration = booking.totalDays || (packagesArr && packagesArr.length > 0 ? packagesArr.reduce((a,p) => a + (p.duration||0), 0) : packageInfo.duration || 'N/A');
    
    const bookingDate = booking.bookingDate || booking.preferredDate || booking.createdAt;
    const totalAmount = booking.totalPrice || booking.totalAmount || 0;
    const guests = booking.guests || booking.numberOfGuests || 1;

    return {
      clientName,
      clientEmail, 
      clientPhone,
      packageName,
      packagePrice,
      packageDuration,
      bookingDate,
      totalAmount,
      guests
    };
  }, [booking]); // 🛠️ FIX: Only depend on booking

  // ============================================================================
  // 🎯 EARLY RETURN IF NO BOOKING OR MODAL CLOSED (AFTER HOOKS)
  // ============================================================================
  if (!booking || !isOpen) return null;

  // ============================================================================
  // 🎯 EVENT HANDLERS
  // ============================================================================
  const handleStatusChange = async (newStatus) => {
    if (newStatus !== booking.status) {
      await onStatusUpdate(booking._id, newStatus);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const res = await bookingService.saveAdminNotes(booking._id, adminNotes);
      // bookingService returns axios response; extract updated booking
      const updated = res?.data?.data || res?.data || res || {};
      // Update context so lists/modals reflect new notes
      if (updated && updated._id) {
        updateBookingLocal(updated);
      } else {
        // If server returned minimal data, merge locally
        updateBookingLocal({ ...booking, adminNotes });
      }
      showToast('Admin notes saved', 'success');
    } catch (err) {
      console.error('Failed to save admin notes', err);
      showToast(err?.message || 'Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      const res = await bookingService.resendConfirmation(booking._id);
      showToast(res?.message || 'Confirmation email resent', 'success');
    } catch (err) {
      console.error('Failed to resend confirmation', err);
      showToast(err?.message || 'Failed to resend confirmation', 'error');
    }
  };

  // ============================================================================
  // 🎯 FORMATTING FUNCTIONS
  // ============================================================================
  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ============================================================================
  // 🎯 MODAL CONFIGURATION
  // ============================================================================
  const tabs = [
    { id: "details", label: "Booking Details", icon: "📋" },
    { id: "client", label: "Client Info", icon: "👤" },
    { id: "package", label: "Package Details", icon: "📦" },
    { id: "notes", label: "Admin Notes", icon: "📝" },
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ============================================================================
  // 🎯 COMPONENT RENDER
  // ============================================================================
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <BookingStatusBadge status={booking.status} />
              {booking.archived && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  📦 Archived
                </span>
              )}
            </div>
            <p className="text-gray-600">
              Booking ID: <span className="font-mono text-gray-800">{booking._id}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Created: {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl p-2"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                aria-selected={activeTab === tab.id}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BOOKING DETAILS */}
          {activeTab === "details" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(formattedData.totalAmount)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">Number of Guests</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formattedData.guests}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">Booking Date</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDate(formattedData.bookingDate)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">
                      Created on {formatDate(booking.createdAt)}
                    </span>
                  </div>
                  {booking.statusUpdatedAt && (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">
                        Status changed to {booking.status} on {formatDate(booking.statusUpdatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: CLIENT INFORMATION */}
          {activeTab === "client" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <p className="text-gray-900 font-medium">
                    {formattedData.clientName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <p className="text-gray-900">
                    {formattedData.clientEmail}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <p className="text-gray-900">
                    {formattedData.clientPhone}
                  </p>
                </div>
                {booking.specialRequests && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <p className="text-gray-900 bg-white p-3 rounded border border-gray-300">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PACKAGE DETAILS */}
          {activeTab === "package" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                  <p className="text-gray-900 font-medium">
                    {formattedData.packageName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <p className="text-gray-900">
                    {formattedData.packageDuration} days
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
                  <p className="text-gray-900">
                    {formatCurrency(formattedData.packagePrice)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                  <p className="text-lg text-gray-900 font-bold">
                    {formatCurrency(formattedData.totalAmount)}
                  </p>
                </div>
              </div>
              
              {/* Aggregate inclusions from packages when available */}
              {(() => {
                const packagesArr = booking.packages || [];
                const hasPackages = packagesArr.length > 0;
                const transport = hasPackages ? packagesArr.some(p => p.transport) : !!booking.package?.transport;
                const meals = hasPackages ? packagesArr.some(p => p.meals) : !!booking.package?.meals;
                const stay = hasPackages ? packagesArr.some(p => p.stay) : !!booking.package?.stay;

                if (!transport && !meals && !stay) return null;

                return (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions</label>
                    <div className="flex space-x-4 text-sm">
                      {transport && <span className="text-gray-700">🚗 Transport</span>}
                      {meals && <span className="text-gray-700">🍽️ Meals</span>}
                      {stay && <span className="text-gray-700">🏨 Stay</span>}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: ADMIN NOTES */}
          {activeTab === "notes" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes & Comments
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows="6"
                disabled={booking.archived}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                placeholder={booking.archived ? "Notes cannot be edited for archived bookings." : "Add internal notes, comments, or special instructions for this booking..."}
              />
              {!booking.archived && (
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleSaveNotes}
                    variant="primary"
                    size="sm"
                  >
                    Save Notes
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-500">
            Last updated: {new Date(booking.updatedAt || booking.createdAt).toLocaleString()}
          </div>
            <div className="flex space-x-3">
            {!booking.archived && (
              <>
                {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                  <Button
                    onClick={() => handleStatusChange("confirmed")}
                    variant="primary"
                  >
                    ✅ Confirm Booking
                  </Button>
                )}
                {booking.status !== "cancelled" && (
                  <Button
                    onClick={() => handleStatusChange("cancelled")}
                    variant="danger"
                  >
                    ❌ Cancel Booking
                  </Button>
                )}
                {booking.status === "cancelled" && (
                  <Button
                    onClick={() => handleStatusChange("pending")}
                    variant="secondary"
                  >
                    🔄 Reopen Booking
                  </Button>
                )}
                {booking.status === 'confirmed' && (
                  <Button onClick={handleResendConfirmation} variant="outline">
                    🔁 Resend Confirmation
                  </Button>
                )}
              </>
            )}
            <Button
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;