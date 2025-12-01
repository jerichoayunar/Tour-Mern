// src/pages/admin/ManageInquiries.jsx
import React, { useState, useEffect, useCallback } from 'react';
import InquiriesTable from '../../components/admin/inquiries/InquiriesTable';
import InquiryFilters from '../../components/admin/inquiries/InquiryFilters';
import InquiryModal from '../../components/admin/inquiries/InquiryModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import inquiryService from '../../services/inquiryService';
import { useToast } from '../../context/ToastContext';
import { Mail, MessageSquare, Clock, Archive } from 'lucide-react';

const ManageInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sort: 'newest' });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const { showToast } = useToast();

  const fetchInquiries = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        ...filters,
        ...params,
        onlyArchived: showArchived
      };
      const response = await inquiryService.getInquiries(queryParams);
      const resp = response?.data ?? response;
      if (resp) {
        setInquiries(resp.inquiries || resp.data || []);
        setPagination({
          page: resp.page || 1,
          pages: resp.pages || 1,
          total: resp.total || resp.count || 0
        });
      }
    } catch (error) {
      console.debug('fetchInquiries error:', error);
      showToast('Error fetching inquiries', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showArchived, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await inquiryService.getInquiryStats();
      const resp = response?.data ?? response;
      setStats(resp?.data ?? resp ?? null);
    } catch (error) {
      console.debug('fetchStats error:', error);
      showToast('Error fetching stats', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, [fetchInquiries, fetchStats]);

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
      const resp = response?.data ?? response;
      setSelectedInquiry(resp?.data ?? resp ?? null);
      setIsModalOpen(true);
    } catch (error) {
      console.debug('handleViewInquiry error:', error);
      showToast('Error fetching inquiry details', 'error');
    }
  };

  const handleUpdateInquiry = async (updateData) => {
    try {
      const response = await inquiryService.updateInquiry(selectedInquiry._id, updateData);
      const resp = response?.data ?? response;
      if (!resp) throw new Error('Failed to update inquiry');
      if (resp.success || resp) {
        showToast('Inquiry updated successfully!', 'success');
        await fetchInquiries();
        await fetchStats();
        setIsModalOpen(false);
        setSelectedInquiry(null);
      }
    } catch (error) {
      console.debug('handleUpdateInquiry error:', error);
      showToast('Error updating inquiry', 'error');
    }
  };

  const handleMarkAsRead = async (inquiryId) => {
    try {
      const response = await inquiryService.markAsRead(inquiryId);
      const resp = response?.data ?? response;
      if (resp.success || resp) {
        showToast('Inquiry marked as read!', 'success');
        await fetchInquiries();
        await fetchStats();
      }
    } catch (error) {
      console.debug('handleMarkAsRead error:', error);
      showToast('Error marking inquiry as read', 'error');
    }
  };

  const handleArchiveInquiry = (inquiry) => {
    setConfirmationModal({
      isOpen: true,
      type: 'warning',
      title: 'Archive Inquiry',
      message: `Are you sure you want to archive the inquiry from "${inquiry.name}"? It will be moved to the archived list.`,
      confirmText: 'Archive',
      onConfirm: async () => {
        try {
          const response = await inquiryService.archiveInquiry(inquiry._id);
          const resp = response?.data ?? response;
          if (resp.success || resp) {
            showToast('Inquiry archived successfully!', 'success');
            await fetchInquiries();
            await fetchStats();
          }
        } catch (error) {
          console.debug('archiveInquiry error:', error);
          showToast('Error archiving inquiry', 'error');
        }
      }
    });
  };

  const handleRestoreInquiry = (inquiry) => {
    setConfirmationModal({
      isOpen: true,
      type: 'info',
      title: 'Restore Inquiry',
      message: `Are you sure you want to restore the inquiry from "${inquiry.name}"? It will be moved back to the active list.`,
      confirmText: 'Restore',
      onConfirm: async () => {
        try {
          const response = await inquiryService.restoreInquiry(inquiry._id);
          const resp = response?.data ?? response;
          if (resp.success || resp) {
            showToast('Inquiry restored successfully!', 'success');
            await fetchInquiries();
            await fetchStats();
          }
        } catch (error) {
          console.debug('restoreInquiry error:', error);
          showToast('Error restoring inquiry', 'error');
        }
      }
    });
  };

  const handlePermanentDelete = (inquiry) => {
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Inquiry Permanently',
      message: `Are you sure you want to permanently delete the inquiry from "${inquiry.name}"? This action cannot be undone.`,
      confirmText: 'Delete Forever',
      onConfirm: async () => {
        try {
          const response = await inquiryService.permanentDeleteInquiry(inquiry._id);
          const resp = response?.data ?? response;
          if (resp.success || resp) {
            showToast('Inquiry permanently deleted!', 'success');
            await fetchInquiries();
            await fetchStats();
          }
        } catch (error) {
          console.debug('permanentDelete error:', error);
          showToast('Error deleting inquiry', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Management</h1>
          <p className="text-gray-600">Manage customer inquiries and responses</p>
        </div>
        
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            showArchived 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {showArchived ? '← Back to Active Inquiries' : '📦 View Archived Inquiries'}
        </button>
      </div>

      {/* Stats Cards - Hide when viewing archives */}
      {stats && !showArchived && (
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
        onClearFilters={() => setFilters({ sort: 'newest' })}
      />

      {/* Table */}
      <InquiriesTable
        inquiries={inquiries}
        loading={loading}
        showArchived={showArchived}
        onView={handleViewInquiry}
        onMarkAsRead={handleMarkAsRead}
        onArchive={handleArchiveInquiry}
        onRestore={handleRestoreInquiry}
        onPermanentDelete={handlePermanentDelete}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
      />
    </div>
  );
};

export default ManageInquiries;