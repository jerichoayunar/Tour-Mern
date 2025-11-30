// src/components/bookings/BookingCard.jsx
import React from 'react';
import { Calendar, Users, Mail, Phone, Clock, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { formatPrice, formatDate } from '../../../utils/formatters';
import { countInclusionDays, uniqueInclusionsFromPackages, tagToEmoji } from '../../../utils/inclusions';

const BookingCard = ({ booking, onStatusUpdate, onDelete, onCancel, onViewDetails, isAdmin = false }) => {
  const {
    _id,
    package: tourPackage,
    packages,
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {(() => {
                const pkgs = packages && packages.length > 0 ? packages : (tourPackage ? [tourPackage] : []);
                if (pkgs.length === 0) return 'Package Not Available';
                if (pkgs.length <= 2) return pkgs.map(p => p.title).join(', ');
                return `${pkgs[0].title}, ${pkgs[1].title} +${pkgs.length - 2}`;
              })()}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Booking ID:</span>
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{_id.slice(-8).toUpperCase()}</span>
              <button
                title="Copy full booking ID"
                onClick={() => { navigator.clipboard?.writeText(_id); }}
                className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                aria-label="Copy booking id"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(status)} w-fit`} role="status" aria-live="polite">
              {getStatusIcon(status)}
              <span className="text-sm font-bold capitalize">{status}</span>
            </div>
            {booking.cancellation?.requested && booking.status === 'confirmed' && (
              <div className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-800 border border-blue-100">Cancellation requested</div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trip Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Trip Details</h4>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium">{formatDate(bookingDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Guests</p>
              <p className="font-medium">{guests} person(s)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-5 h-5 flex items-center justify-center text-blue-500 font-bold text-lg">₱</div>
            <div>
              <p className="text-xs text-gray-500">Total Price</p>
              <p className="font-bold text-lg text-blue-600">{formatPrice(totalPrice)}</p>
            </div>
          </div>
          {/* Total Days (if available) */}
          {(booking.totalDays || (packages && packages.length > 0)) && (
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Total Days</p>
                <p className="font-medium">{booking.totalDays ?? packages.reduce((a,p) => a + (p.duration || 0), 0)} day{(booking.totalDays ?? packages.reduce((a,p) => a + (p.duration || 0), 0)) !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
          {/* Inclusions aggregated from packages or single package */}
          {(() => {
            const pkgs = packages && packages.length > 0 ? packages : (tourPackage ? [tourPackage] : []);
            const tags = uniqueInclusionsFromPackages(pkgs);
            if (!tags || tags.length === 0) return null;
            const shown = tags.slice(0, 3);
            const more = tags.length - shown.length;
            return (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="text-xs text-gray-500">Inclusions</div>
                    <div className="text-sm flex items-center gap-2">
                  {shown.map((t, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700">
                      {tagToEmoji(t) ? <span className="mr-1">{tagToEmoji(t)}</span> : null}
                      <span className="truncate max-w-[10rem]">{t}</span>
                    </span>
                  ))}
                  {more > 0 && <span className="text-xs text-gray-500">+{more} more</span>}
                </div>
              </div>
            );
          })()}
          {/* Package details removed from card; use Details modal for full info */}
        </div>

        {/* Client Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Client Info</h4>
          
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
              {(clientName || 'U').charAt(0)}
            </div>
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-medium">{clientName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium break-all">{clientEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium">{clientPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Special requests removed from card; view in Details modal */}

      {/* Footer / Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500">
          Booked on {formatDate(createdAt)}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <select 
                value={status}
                onChange={(e) => onStatusUpdate && onStatusUpdate(_id, e.target.value)}
                className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                aria-label="Update booking status"
              >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}

          {!isAdmin && status !== 'cancelled' && (
            booking.cancellation?.requested && booking.status === 'confirmed' ? (
              <button
                disabled
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium"
                aria-label="Cancellation requested"
                title="Cancellation request submitted"
              >
                <span className="text-xs">Cancellation requested</span>
              </button>
            ) : (
              <button 
                onClick={() => onCancel && onCancel(booking)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                aria-label="Cancel booking"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            )
          )}
          {/* View Details button */}
          <button
            onClick={() => onViewDetails && onViewDetails(booking)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Details
          </button>

          {/* Rebook feature removed — duplicate booking via UI disabled */}

          {isAdmin && (
            <button 
              onClick={() => onDelete && onDelete(_id)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              aria-label="Delete booking"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;