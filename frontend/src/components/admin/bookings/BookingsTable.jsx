// src/components/admin/bookings/BookingsTable.jsx - COMPLETE FIX
import React from "react";
import BookingStatusBadge from "./BookingStatusBadge";
import BookingActions from "./BookingActions";

const BookingsTable = ({ 
  bookings, 
  onViewDetails, 
  onStatusUpdate, 
  showResultsCount = true,
  isArchived = false,
  onArchive,
  onRestore,
  onDeletePermanent
}) => {
  // ============================================================================
  // 🎯 FORMATTING FUNCTIONS
  // ============================================================================
  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ============================================================================
  // 🎯 UPDATED DATA EXTRACTION - MATCHING BACKEND FIELD NAMES
  // ============================================================================
  const getClientInfo = (booking) => ({
    name: booking.clientName || booking.user?.name || 'Unnamed Client',
    email: booking.clientEmail || booking.user?.email || 'No email',
    phone: booking.clientPhone || booking.phone || 'Not provided',
    initial: (booking.clientName || booking.user?.name || 'C')[0].toUpperCase()
  });

  const getPackageInfo = (booking) => ({
    name: booking.package?.title || booking.package?.name || "—",
    duration: booking.package?.duration
  });

  // ============================================================================
  // 🎯 CLEAN TABLE ROW COMPONENT
  // ============================================================================
  const BookingRow = ({ booking }) => {
    const client = getClientInfo(booking);
    const packageInfo = getPackageInfo(booking);
    
    const guests = booking.guests || 1;
    const amount = booking.totalPrice || booking.totalAmount || 0;
    const bookingDate = booking.bookingDate || booking.createdAt;

    return (
      <tr className="hover:bg-gray-50 transition-colors duration-150">
        {/* CLIENT */}
        <td className="px-6 py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">
                {client.initial}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {client.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {client.email}
              </div>
              {client.phone && client.phone !== 'Not provided' && (
                <div className="text-xs text-gray-400 mt-0.5">
                  📞 {client.phone}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* PACKAGE */}
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 font-medium">
            {packageInfo.name}
          </div>
          {packageInfo.duration && (
            <div className="text-xs text-gray-500 mt-0.5">
              {packageInfo.duration} day{packageInfo.duration !== 1 ? 's' : ''}
            </div>
          )}
        </td>

        {/* DATE */}
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900">
            {formatDate(bookingDate)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {formatTime(bookingDate)}
          </div>
        </td>

        {/* GUESTS */}
        <td className="px-6 py-4 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {guests}
          </div>
        </td>

        {/* AMOUNT */}
        <td className="px-6 py-4 text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(amount)}
          </div>
        </td>

        {/* STATUS */}
        <td className="px-6 py-4 text-center">
          <BookingStatusBadge status={booking.status} />
        </td>

        {/* ACTIONS */}
        <td className="px-6 py-4">
          <div className="flex justify-end">
            <BookingActions
              booking={booking}
              onViewDetails={onViewDetails}
              onStatusUpdate={onStatusUpdate}
              isArchived={isArchived}
              onArchive={onArchive}
              onRestore={onRestore}
              onDeletePermanent={onDeletePermanent}
            />
          </div>
        </td>
      </tr>
    );
  };

  // ============================================================================
  // 🎯 MAIN COMPONENT RENDER
  // ============================================================================
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* SCROLL CONTAINER WITH PROPER HEIGHT */}
      <div 
        className="overflow-auto" 
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          position: 'relative'
        }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <caption className="sr-only">Bookings list with client information and actions</caption>
          
          {/* STICKY HEADER */}
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Package
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Guests
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <BookingRow key={booking._id} booking={booking} />
            ))}
          </tbody>
        </table>
      </div>

      {/* RESULTS COUNT */}
      {showResultsCount && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTable;