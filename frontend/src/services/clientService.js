import api from './api';

// Get all clients with filtering and pagination
export const getClients = async (params = {}) => {
  try {
    const response = await api.get('/clients', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single client by ID
export const getClient = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update client
export const updateClient = async (clientId, clientData) => {
  try {
    const response = await api.put(`/clients/${clientId}`, clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete client
export const deleteClient = async (clientId) => {
  try {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get client statistics
export const getClientStats = async () => {
  try {
    const response = await api.get('/clients/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Enhanced client service with additional utilities
export const clientService = {
  // Basic CRUD operations
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getClientStats,

  // Utility functions for frontend
  transformClientData: (client) => ({
    id: client._id || client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    role: client.role,
    status: client.status,
    loginMethod: client.loginMethod,
    avatar: client.avatar,
    emailVerified: client.emailVerified,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    lastLogin: client.lastLogin,
    bookingCount: client.bookingCount || 0,
    totalSpent: client.totalSpent || 0
  }),

  // Filter clients by various criteria
  filterClients: (clients, filters) => {
    return clients.filter(client => {
      let matches = true;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        matches = matches && (
          client.name?.toLowerCase().includes(searchTerm) ||
          client.email?.toLowerCase().includes(searchTerm) ||
          client.phone?.includes(searchTerm)
        );
      }

      if (filters.status && filters.status !== 'all') {
        matches = matches && client.status === filters.status;
      }

      if (filters.role && filters.role !== 'all') {
        matches = matches && client.role === filters.role;
      }

      if (filters.loginMethod && filters.loginMethod !== 'all') {
        matches = matches && client.loginMethod === filters.loginMethod;
      }

      return matches;
    });
  },

  // Sort clients
  sortClients: (clients, sortBy, sortOrder = 'asc') => {
    return [...clients].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle dates
      if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle undefined values
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  },

  // Get client status options
  getStatusOptions: () => [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'suspended', label: 'Suspended', color: 'red' }
  ],

  // Get role options
  getRoleOptions: () => [
    { value: 'user', label: 'User' },
    { value: 'premium', label: 'Premium User' },
    { value: 'agent', label: 'Travel Agent' }
  ],

  // Get login method options
  getLoginMethodOptions: () => [
    { value: 'local', label: 'Email/Password' },
    { value: 'google', label: 'Google' }
  ]
};

export default clientService;