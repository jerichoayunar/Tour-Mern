import React, { useState } from 'react';
import { clientService } from '../../../services/clientService';

const ClientsTable = ({ 
  clients, 
  filters, 
  showArchived,
  onFiltersChange, 
  onViewClient, 
  onUpdateClient: _onUpdateClient, 
  onArchiveClient,
  onRestoreClient,
  onPermanentDelete,
  onRefresh 
}) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedClients = clientService.sortClients(clients, sortField, sortOrder);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800 border border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
      suspended: 'bg-red-100 text-red-800 border border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      user: 'bg-blue-100 text-blue-800 border border-blue-200',
      premium: 'bg-purple-100 text-purple-800 border border-purple-200',
      agent: 'bg-orange-100 text-orange-800 border border-orange-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleConfig[role] || 'bg-gray-100 text-gray-800'}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Filters */}
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {showArchived ? 'Archived Clients' : 'Active Clients'} ({sortedClients.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {showArchived ? 'View and manage archived accounts' : 'Manage and view all client accounts'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search clients..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
            
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filters.role}
              onChange={(e) => onFiltersChange({ ...filters, role: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="premium">Premium</option>
              <option value="agent">Agent</option>
            </select>

            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Client
                  <span className="text-sm">{getSortIcon('name')}</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center gap-2">
                  Role
                  <span className="text-sm">{getSortIcon('role')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <span className="text-sm">{getSortIcon('status')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-2">
                  Joined
                  <span className="text-sm">{getSortIcon('createdAt')}</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {client.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {client.loginMethod}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.email}</div>
                  <div className="text-sm text-gray-500">{client.phone || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(client.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(client.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(client.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onViewClient(client.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <span>👁️</span>
                      View
                    </button>
                    
                    {showArchived ? (
                      <>
                        <button
                          onClick={() => onRestoreClient(client.id)}
                          className="text-green-600 hover:text-green-900 font-medium flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <span>🔄</span>
                          Restore
                        </button>
                        <button
                          onClick={() => onPermanentDelete(client.id)}
                          className="text-red-600 hover:text-red-900 font-medium flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <span>🗑️</span>
                          Delete Forever
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onArchiveClient(client.id)}
                        className="text-orange-600 hover:text-orange-900 font-medium flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <span>📦</span>
                        Archive
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedClients.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-gray-600 text-lg font-medium">No clients found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsTable;