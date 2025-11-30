// src/components/admin/inquiries/InquiriesTable.jsx
import React from 'react';
import { Eye, Mail, Trash2, Clock, AlertCircle, ChevronLeft, ChevronRight, Archive } from 'lucide-react';

const InquiriesTable = ({ 
  inquiries, 
  loading, 
  showArchived,
  onView, 
  onMarkAsRead, 
  onArchive,
  onRestore,
  onPermanentDelete,
  pagination,
  onPageChange
}) => {
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-amber-100 text-amber-800 border-amber-200',
      read: 'bg-stone-100 text-stone-800 border-stone-200',
      replied: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      closed: 'bg-stone-200 text-stone-800 border-stone-300'
    };
    return colors[status] || colors.new;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString, inquiry) => {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Fallback to ID timestamp if date is invalid
    if (inquiry && inquiry._id) {
      try {
        const timestamp = parseInt(inquiry._id.substring(0, 8), 16) * 1000;
        const idDate = new Date(timestamp);
        if (!isNaN(idDate.getTime())) {
          return idDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch {
        // Ignore error
      }
    }
    
    return 'N/A';
  };

  const isNewInquiry = (createdAt, status) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(createdAt) > twentyFourHoursAgo && status === 'new';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  if (!inquiries.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No inquiries found</h3>
        <p className="mt-2 text-gray-500">No inquiries match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inquiry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <tr 
                key={inquiry._id} 
                className={`hover:bg-gray-50 transition-colors ${
                  inquiry.status === 'new' ? 'bg-amber-50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {isNewInquiry(inquiry.createdAt, inquiry.status) && (
                      <span className="flex-shrink-0 w-2 h-2 bg-amber-600 rounded-full mr-3"></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inquiry.name}
                        </p>
                        {isNewInquiry(inquiry.createdAt, inquiry.status) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {inquiry.email}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {inquiry.subject || 'No subject'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(inquiry.priority)}`}>
                    {inquiry.priority === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    {formatDate(inquiry.createdAt, inquiry)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onView(inquiry)}
                    className="text-amber-600 hover:text-amber-900 transition-colors p-1 rounded"
                    title="View Inquiry"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {showArchived ? (
                    <>
                      <button
                        onClick={() => onRestore(inquiry)}
                        className="text-green-600 hover:text-green-900 transition-colors p-1 rounded"
                        title="Restore Inquiry"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPermanentDelete(inquiry)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                        title="Delete Forever"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {inquiry.status === 'new' && (
                        <button
                          onClick={() => onMarkAsRead(inquiry._id)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded"
                          title="Mark as Read"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onArchive(inquiry)}
                        className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded"
                        title="Archive Inquiry"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * 10 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pagination.page * 10, pagination.total)}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesTable;