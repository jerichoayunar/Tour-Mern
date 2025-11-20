// src/components/bookings/BookingCard.jsx
import React from 'react';
import { Calendar, Users, Mail, Phone, Clock, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { formatPrice, formatDate } from '../../../utils/formatters';

const BookingCard = ({ booking, onStatusUpdate, onDelete, onCancel, isAdmin = false }) => {
  const {
    _id,
    package: tourPackage,
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
        return 'bg-amber-100 text-amber-800 border-amber-200';
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
              {tourPackage?.title || 'Package Not Available'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Booking ID:</span>
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{_id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(status)} w-fit`}>
            {getStatusIcon(status)}
            <span className="text-sm font-bold capitalize">{status}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trip Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Trip Details</h4>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium">{formatDate(bookingDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Users className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Guests</p>
              <p className="font-medium">{guests} person(s)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-5 h-5 flex items-center justify-center text-amber-500 font-bold text-lg">₱</div>
            <div>
              <p className="text-xs text-gray-500">Total Price</p>
              <p className="font-bold text-lg text-amber-600">{formatPrice(totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Client Info</h4>
          
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
              {clientName.charAt(0)}
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

      {/* Special Requests */}
      {specialRequests && (
        <div className="px-6 pb-6">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-amber-800 mb-1">Special Requests</h5>
                <p className="text-sm text-amber-700 leading-relaxed">{specialRequests}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500">
          Booked on {formatDate(createdAt)}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <select 
              value={status}
              onChange={(e) => onStatusUpdate(_id, e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}

          {!isAdmin && status !== 'cancelled' && (
            <button 
              onClick={() => onCancel(_id)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          )}
          
          <button 
            onClick={() => onDelete(_id)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;