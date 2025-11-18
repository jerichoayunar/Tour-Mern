// src/pages/admin/ManageInquiries.jsx
import React, { useState, useEffect } from 'react';
import InquiriesTable from '../../components/admin/inquiries/InquiriesTable';
import InquiryFilters from '../../components/admin/inquiries/InquiryFilters';
import InquiryModal from '../../components/admin/inquiries/InquiryModal';
import inquiryService from '../../services/inquiryService';
import { useToast } from '../../context/ToastContext';
import { Mail, MessageSquare, Clock, Archive } from 'lucide-react';

const ManageInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const { showToast } = useToast();

  const fetchInquiries = async (params = {}) => {
    setLoading(true);
    try {
      const response = await inquiryService.getInquiries({ ...filters, ...params });
      if (response.success) {
        setInquiries(response.inquiries || []);
        setPagination({
          page: response.page || 1,
          pages: response.pages || 1,
          total: response.total || 0
        });
      }
    } catch (error) {
      showToast('Error fetching inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await inquiryService.getInquiryStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      showToast('Error fetching stats', 'error');
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, [filters]);

  const handleViewInquiry = async (inquiry) => {
    try {
      // If inquiry is new, mark it as read first
      if (inquiry.status === 'new') {
        await inquiryService.markAsRead(inquiry._id);
        // Refresh the data to show updated status
        await fetchInquiries();
        await fetchStats();
      }
      
      // Then fetch the updated inquiry details
      const response = await inquiryService.getInquiryById(inquiry._id);
      if (response.success) {
        setSelectedInquiry(response.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      showToast('Error fetching inquiry details', 'error');
    }
  };

  const handleUpdateInquiry = async (updateData) => {
    try {
      const response = await inquiryService.updateInquiry(selectedInquiry._id, updateData);
      if (response.success) {
        showToast('Inquiry updated successfully!', 'success');
        await fetchInquiries();
        await fetchStats();
        setIsModalOpen(false);
        setSelectedInquiry(null);
      }
    } catch (error) {
      showToast('Error updating inquiry', 'error');
    }
  };

  const handleMarkAsRead = async (inquiryId) => {
    try {
      const response = await inquiryService.markAsRead(inquiryId);
      if (response.success) {
        showToast('Inquiry marked as read!', 'success');
        await fetchInquiries();
        await fetchStats();
      }
    } catch (error) {
      showToast('Error marking inquiry as read', 'error');
    }
  };

  const handleDeleteInquiry = async (inquiry) => {
    if (window.confirm(`Delete inquiry from ${inquiry.name}?`)) {
      try {
        const response = await inquiryService.deleteInquiry(inquiry._id);
        if (response.success) {
          showToast('Inquiry deleted successfully!', 'success');
          await fetchInquiries();
          await fetchStats();
        }
      } catch (error) {
        showToast('Error deleting inquiry', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inquiry Management</h1>
        <p className="text-gray-600">Manage customer inquiries and responses</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Inquiries */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* New Inquiries */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byStatus?.new || 0}</p>
              </div>
            </div>
          </div>

          {/* Replied */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byStatus?.replied || 0}</p>
              </div>
            </div>
          </div>

          {/* Last 7 Days */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Archive className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent?.last7Days || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <InquiryFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({})}
      />

      {/* Table */}
      <InquiriesTable
        inquiries={inquiries}
        loading={loading}
        onView={handleViewInquiry}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteInquiry}
        pagination={pagination}
        onPageChange={(page) => fetchInquiries({ pageNumber: page })}
      />

      {/* Modal */}
      {isModalOpen && (
        <InquiryModal
          inquiry={selectedInquiry}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInquiry(null);
          }}
          onUpdate={handleUpdateInquiry}
        />
      )}
    </div>
  );
};

export default ManageInquiries;