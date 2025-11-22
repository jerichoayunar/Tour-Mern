// src/components/admin/inquiries/InquiryModal.jsx
import React, { useState, useEffect } from 'react';
import { Send, User, Mail, Calendar, MessageSquare, Clock } from 'lucide-react';
import Modal from '../../ui/Modal';

const InquiryModal = ({ inquiry, isOpen, onClose, onUpdate }) => {
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setResponse(inquiry.response || '');
      setStatus(inquiry.status);
      setPriority(inquiry.priority);
    }
  }, [inquiry]);

  if (!isOpen || !inquiry) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onUpdate({
        response: response.trim(),
        status,
        priority
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date('invalid');
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Fallback to ID timestamp if date is invalid or missing
    if (inquiry && inquiry._id) {
       try {
         const timestamp = parseInt(inquiry._id.substring(0, 8), 16) * 1000;
         const idDate = new Date(timestamp);
         if (!isNaN(idDate.getTime())) {
           return idDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800',
      closed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.new;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inquiry from ${inquiry.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Inquiry Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900 font-medium">{inquiry.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{inquiry.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted</p>
                <p className="text-gray-900 font-medium">{formatDate(inquiry.createdAt)}</p>
              </div>
            </div>

            {inquiry.respondedAt && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Responded</p>
                  <p className="text-gray-900 font-medium">{formatDate(inquiry.respondedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Current Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
              {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Current Priority</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(inquiry.priority)}`}>
              {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)}
            </span>
          </div>
        </div>

        {/* Subject */}
        {inquiry.subject && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Subject</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{inquiry.subject}</p>
          </div>
        )}

        {/* Message */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Message
          </h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        </div>

        {/* Existing Response */}
        {inquiry.response && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Previous Response</h3>
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <p className="text-gray-700 whitespace-pre-wrap">{inquiry.response}</p>
              {inquiry.respondedBy && (
                <p className="text-sm text-gray-500 mt-2">
                  Responded by: {inquiry.respondedBy.name} ({inquiry.respondedBy.email})
                </p>
              )}
            </div>
          </div>
        )}

        {/* Response Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              placeholder="Type your response here... (Adding a response will automatically set status to 'Replied')"
            />
            <p className="mt-1 text-sm text-gray-500">
              {response.length}/2000 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Update Inquiry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};


export default InquiryModal;