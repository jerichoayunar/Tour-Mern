import React, { useState, useEffect, useCallback } from 'react';
import { clientService } from '../../services/clientService';
import ClientsTable from '../../components/admin/clients/ClientsTable';
import ClientDetailsModal from '../../components/admin/clients/ClientDetailsModal';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import Loader from "../../components/ui/Loader";
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

const ManageUsers = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
    loginMethod: 'all'
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

  // Fetch clients and stats on component mount
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        onlyArchived: showArchived
      };
      
      const [clientsResponse, statsResponse] = await Promise.all([
        clientService.getClients(params),
        clientService.getClientStats()
      ]);

      // clientService already returns parsed data (not axios response)
      const respClients = clientsResponse?.data ?? clientsResponse;
      const clientsData = Array.isArray(respClients) ? respClients : (respClients && respClients.success !== undefined ? (Array.isArray(respClients.data) ? respClients.data : []) : []);
      setClients(clientsData.map(clientService.transformClientData));

      const statsResp = statsResponse?.data ?? statsResponse;
      const statsData = statsResp && statsResp.success !== undefined ? (statsResp.data ?? statsResp) : statsResp ?? null;
      setStats(statsData);
    } catch (error) {
      showToast(error.message || 'Failed to fetch clients data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showArchived, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Refetch when archive mode changes

  // Apply filters when clients or filters change
  useEffect(() => {
    const filtered = clientService.filterClients(clients, filters);
    setFilteredClients(filtered);
  }, [clients, filters]);

  

  const handleViewClient = async (clientId) => {
    try {
      const response = await clientService.getClient(clientId);
      const clientData = response?.data ?? response;
      setSelectedClient(clientService.transformClientData(clientData));
      setIsModalOpen(true);
    } catch (error) {
      showToast(error.message || 'Failed to fetch client details', 'error');
    }
  };

  const handleUpdateClient = async (clientId, updateData) => {
    try {
      const response = await clientService.updateClient(clientId, updateData);
      
      // Update local state
      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? clientService.transformClientData(response?.data ?? response)
          : client
      ));
      
      showToast('Client updated successfully', 'success');

      // Refresh stats
      const statsResponse = await clientService.getClientStats();
      setStats(statsResponse?.data ?? statsResponse ?? null);

      return response?.data ?? response;
    } catch (error) {
      showToast(error.message || 'Failed to update client', 'error');
      throw error;
    }
  };

  const handleArchiveClient = async (clientId) => {
    setConfirmationModal({
      isOpen: true,
      type: 'warning',
      title: 'Archive Client',
      message: 'Are you sure you want to archive this client? They will be hidden from the main list but can be restored later.',
      confirmText: 'Archive',
      onConfirm: async () => {
        try {
          await clientService.archiveClient(clientId);
          setClients(prev => prev.filter(client => client.id !== clientId));
          showToast('Client archived successfully', 'success');
          const statsResponse = await clientService.getClientStats();
          setStats(statsResponse?.data ?? statsResponse ?? null);
        } catch (error) {
          showToast(error.message || 'Failed to archive client', 'error');
        }
      }
    });
  };

  const handleRestoreClient = async (clientId) => {
    setConfirmationModal({
      isOpen: true,
      type: 'info',
      title: 'Restore Client',
      message: 'Are you sure you want to restore this client? They will become active again.',
      confirmText: 'Restore',
      onConfirm: async () => {
        try {
          await clientService.restoreClient(clientId);
          setClients(prev => prev.filter(client => client.id !== clientId));
          showToast('Client restored successfully', 'success');
          const statsResponse = await clientService.getClientStats();
          setStats(statsResponse?.data ?? statsResponse ?? null);
        } catch (error) {
          showToast(error.message || 'Failed to restore client', 'error');
        }
      }
    });
  };

  const handlePermanentDelete = async (clientId) => {
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Permanently Delete Client',
      message: 'This will permanently delete the client and cannot be undone. Continue?',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await clientService.permanentDeleteClient(clientId);
          setClients(prev => prev.filter(client => client.id !== clientId));
          showToast('Client permanently deleted', 'success');
          const statsResponse = await clientService.getClientStats();
          setStats(statsResponse?.data ?? statsResponse ?? null);
        } catch (error) {
          showToast(error.message || 'Failed to delete client', 'error');
        }
      }
    });
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-platinum p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Client Management
            </h1>
            <p className="text-lg text-gray-600">
              Manage and monitor your clients
            </p>
          </div>
          
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              showArchived 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showArchived ? '← Back to Active Clients' : '📦 View Archived Clients'}
            {stats?.archivedClients > 0 && !showArchived && (
              <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                {stats.archivedClients}
              </span>
            )}
          </button>
        </div>

        {/* Statistics Cards removed per request to declutter admin clients view */}

        {/* Clients Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ClientsTable
            clients={filteredClients}
            filters={filters}
            showArchived={showArchived}
            onFiltersChange={handleFiltersChange}
            onViewClient={handleViewClient}
            onUpdateClient={handleUpdateClient}
            onArchiveClient={handleArchiveClient}
            onRestoreClient={handleRestoreClient}
            onPermanentDelete={handlePermanentDelete}
            onRefresh={fetchData}
          />
        </div>

        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
          confirmText={confirmationModal.confirmText}
        />

        {/* Client Details Modal */}
        {isModalOpen && selectedClient && (
          <ClientDetailsModal
            client={selectedClient}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedClient(null);
            }}
            onUpdate={handleUpdateClient}
          />
        )}
    </div>
  );
};

export default ManageUsers;