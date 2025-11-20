import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/clientService';
import ClientsTable from '../../components/admin/clients/ClientsTable';
import ClientDetailsModal from '../../components/admin/clients/ClientDetailsModal';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import Loader from "../../components/ui/Loader";
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

  // Fetch clients and stats on component mount
  useEffect(() => {
    fetchData();
  }, [showArchived]); // Refetch when archive mode changes

  // Apply filters when clients or filters change
  useEffect(() => {
    const filtered = clientService.filterClients(clients, filters);
    setFilteredClients(filtered);
  }, [clients, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        onlyArchived: showArchived
      };
      
      const [clientsResponse, statsResponse] = await Promise.all([
        clientService.getClients(params),
        clientService.getClientStats()
      ]);
      
      setClients(clientsResponse.data.map(clientService.transformClientData));
      setStats(statsResponse.data);
    } catch (error) {
      showToast(error.message || 'Failed to fetch clients data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = async (clientId) => {
    try {
      const response = await clientService.getClient(clientId);
      setSelectedClient(clientService.transformClientData(response.data));
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
          ? clientService.transformClientData(response.data)
          : client
      ));
      
      showToast('Client updated successfully', 'success');

      // Refresh stats
      const statsResponse = await clientService.getClientStats();
      setStats(statsResponse.data);

      return response.data;
    } catch (error) {
      showToast(error.message || 'Failed to update client', 'error');
      throw error;
    }
  };

  const handleArchiveClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to archive this client? They will be hidden from the main list but can be restored later.')) {
      return;
    }

    try {
      await clientService.archiveClient(clientId);
      
      // Update local state
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      showToast('Client archived successfully', 'success');

      // Refresh stats
      const statsResponse = await clientService.getClientStats();
      setStats(statsResponse.data);
    } catch (error) {
      showToast(error.message || 'Failed to archive client', 'error');
    }
  };

  const handleRestoreClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to restore this client? They will become active again.')) {
      return;
    }

    try {
      await clientService.restoreClient(clientId);
      
      // Update local state
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      showToast('Client restored successfully', 'success');

      // Refresh stats
      const statsResponse = await clientService.getClientStats();
      setStats(statsResponse.data);
    } catch (error) {
      showToast(error.message || 'Failed to restore client', 'error');
    }
  };

  const handlePermanentDelete = async (clientId) => {
    const confirmText = prompt('WARNING: This action cannot be undone. Type "DELETE" to confirm permanent deletion:');
    
    if (confirmText !== 'DELETE') {
      if (confirmText !== null) {
        showToast('Deletion cancelled. You must type DELETE to confirm.', 'info');
      }
      return;
    }

    try {
      await clientService.permanentDeleteClient(clientId);
      
      // Update local state
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      showToast('Client permanently deleted', 'success');

      // Refresh stats
      const statsResponse = await clientService.getClientStats();
      setStats(statsResponse.data);
    } catch (error) {
      showToast(error.message || 'Failed to delete client', 'error');
    }
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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

        {/* Statistics Cards Grid - Hide when viewing archives */}
        {stats && !showArchived && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStatsCard
              title="Total Clients"
              value={stats.totalClients}
              trend={stats.growthRate}
              icon="👥"
              color="blue"
            />
            <AdminStatsCard
              title="New Clients (30 days)"
              value={stats.newClientsLast30Days}
              trend="Last month"
              icon="🆕"
              color="green"
            />
            <AdminStatsCard
              title="Active Clients"
              value={stats.byStatus?.active || 0}
              trend={`${stats.byStatus?.inactive || 0} inactive`}
              icon="✅"
              color="green"
            />
            <AdminStatsCard
              title="Google Users"
              value={stats.byLoginMethod?.google || 0}
              trend={`${stats.byLoginMethod?.local || 0} local`}
              icon="🔐"
              color="purple"
            />
          </div>
        )}

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
    </div>
  );
};

export default ManageUsers;