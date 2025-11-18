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
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
    loginMethod: 'all'
  });
  const { addToast } = useToast();

  // Fetch clients and stats on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters when clients or filters change
  useEffect(() => {
    if (clients.length > 0) {
      const filtered = clientService.filterClients(clients, filters);
      setFilteredClients(filtered);
    }
  }, [clients, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsResponse, statsResponse] = await Promise.all([
        clientService.getClients(),
        clientService.getClientStats()
      ]);
      
      setClients(clientsResponse.data.map(clientService.transformClientData));
      setStats(statsResponse.data);
    } catch (error) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to fetch clients data'
      });
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
      addToast({
        type: 'error',
        message: error.message || 'Failed to fetch client details'
      });
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
      
      addToast({
        type: 'success',
        message: 'Client updated successfully'
      });

      // Refresh stats
      const statsResponse = await clientService.getClientStats();
      setStats(statsResponse.data);

      return response.data;
    } catch (error) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to update client'
      });
      throw error;
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      await clientService.deleteClient(clientId);
      
      // Update local state
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      addToast({
        type: 'success',
        message: 'Client deleted successfully'
      });

      // Refresh stats
      const statsResponse = await clientService.getClientStats();
      setStats(statsResponse.data);
    } catch (error) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to delete client'
      });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Client Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage and monitor your clients
          </p>
        </div>

        {/* Statistics Cards Grid */}
        {stats && (
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
            onFiltersChange={handleFiltersChange}
            onViewClient={handleViewClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
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