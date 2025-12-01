import React from 'react';
import Modal from '../../ui/Modal';
import { CheckCircle, Clock as TimeIcon, XCircle } from 'lucide-react';
import { formatPrice, formatDate, formatDateTime } from '../../../utils/formatters';
import { aggregatePackageInclusions, uniqueInclusionsFromPackage, tagToEmoji } from '../../../utils/inclusions';

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!booking || !isOpen) return null;

  const pkgs = (booking.packages && booking.packages.length > 0)
    ? booking.packages
    : (booking.package ? [booking.package] : []);

  const numGuests = Number(booking.guests || 1);

  const subtotal = pkgs.reduce((acc, p) => acc + ((p.price || 0) * numGuests), 0);
  const serviceFee = booking.serviceFee || 0;
  const taxes = booking.taxes || 0;
  const total = booking.totalPrice ?? booking.totalAmount ?? (subtotal + serviceFee + taxes);

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
        return <TimeIcon className="w-4 h-4" />;
    }
  };

  const aggregateInclusions = (pkg) => aggregatePackageInclusions(pkg);

  

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-4xl w-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <div className="mt-1 text-sm text-gray-500">Created: {formatDateTime(booking.createdAt)}</div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(booking.status)} w-fit`} role="status" aria-live="polite">
            {getStatusIcon(booking.status)}
            <span className="text-sm font-bold capitalize">{booking.status}</span>
          </div>
        </div>

        {/* Actions removed for users: Download Invoice, Print, Close (user-facing controls) */}

        {/* Top summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">Booking Date</div>
            <div className="font-medium">{booking.bookingDate ? formatDate(booking.bookingDate) : 'Not specified'}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">Guests</div>
            <div className="font-medium">{numGuests}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">Total Days</div>
            <div className="font-medium">{booking.totalDays ?? pkgs.reduce((a,p) => a + (p.duration || 0), 0)} day{(booking.totalDays ?? pkgs.reduce((a,p) => a + (p.duration || 0), 0)) !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">Total</div>
            <div className="font-bold text-lg text-blue-600">{formatPrice(total)}</div>
          </div>
        </div>

        {/* Packages */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Packages</h3>
          <div className="space-y-3">
            {pkgs.length === 0 && <div className="text-sm text-gray-500">No package information available</div>}
            {pkgs.map((p) => {
              const inclusions = aggregateInclusions(p);
              const lineTotal = (p.price || 0) * numGuests;
              return (
                <div key={p._id || p.id} className="bg-white border border-gray-100 rounded-lg p-4 flex gap-4">
                  <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {p.image?.url ? <img src={p.image.url} alt={p.title} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-lg">{p.title}</div>
                        <div className="text-xs text-gray-500">{p.duration || 0} day{(p.duration || 0) !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatPrice(p.price || 0)}</div>
                        <div className="text-xs text-gray-500">Per guest</div>
                        <div className="mt-2 font-medium">{formatPrice(lineTotal)}</div>
                      </div>
                    </div>

                    {/* Inclusions */}
                    {
                      (() => {
                        const tags = uniqueInclusionsFromPackage(p);
                        if (tags.length > 0) {
                          return (
                            <div className="mt-3 text-sm text-gray-700">
                              <div className="text-xs text-gray-500">Inclusions</div>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {tags.map((t, i) => (
                                  <span key={i} className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs border border-blue-100">
                                    {tagToEmoji(t) ? <span className="text-xs">{tagToEmoji(t)}</span> : null}
                                    <span className="truncate max-w-[12rem]">{t}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        if (inclusions.transport || inclusions.meals || inclusions.stay) {
                          return (
                            <div className="mt-3 text-sm text-gray-700">
                              <div className="text-xs text-gray-500">Inclusions</div>
                              <div className="flex gap-3 mt-1">
                                {inclusions.transport && <span className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700 text-xs">🚗 Transport</span>}
                                {inclusions.meals && <span className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700 text-xs">🍽️ Meals</span>}
                                {inclusions.stay && <span className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700 text-xs">🏨 Stay</span>}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()
                    }

                    {/* Itinerary (expanded by default) */}
                    {Array.isArray(p.itinerary) && p.itinerary.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Itinerary</div>
                        <div className="mt-2 text-sm text-gray-600 space-y-4">
                          {p.itinerary.map((day) => (
                            <div key={day.day} className="bg-gray-50 p-3 rounded">
                              <div className="font-medium">Day {day.day}: {day.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{day.description}</div>
                              {Array.isArray(day.places) && day.places.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500">Places: {day.places.join(', ')}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment & Admin removed from user view per preference */}

        {/* Cancellation info */}
        {booking.cancellation && (
          <div className="mt-6">
            {booking.cancellation.requested && booking.status !== 'cancelled' && (
              <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800">
                <div className="text-sm font-semibold">Cancellation Request Submitted</div>
                <div className="text-xs mt-1">Requested at: {booking.cancellation.requestedAt ? formatDateTime(booking.cancellation.requestedAt) : 'Unknown'}</div>
                <div className="text-xs mt-1">An administrator will review your request and process the cancellation.</div>
              </div>
            )}

            {booking.cancellation.cancelledAt && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h4 className="text-sm font-semibold text-red-700 mb-2">Cancellation & Refund</h4>
                <div className="text-sm text-red-700">
                  <div className="mb-1"><strong>Cancelled At:</strong> {booking.cancellation.cancelledAt ? formatDateTime(booking.cancellation.cancelledAt) : 'Unknown'}</div>
                  <div className="mb-1"><strong>Cancelled By:</strong> {booking.cancellation.cancelledBy || 'Unknown'}</div>
                  <div className="mb-1"><strong>Reason:</strong> {booking.cancellation.reason || 'Not provided'}</div>
                  <div className="mb-1"><strong>Refund:</strong> {formatPrice(booking.cancellation.refundAmount || 0)} ({booking.cancellation.refundStatus || 'pending'})</div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};

export default BookingDetailsModal;
