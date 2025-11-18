import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import destinationService from '../../services/destinationService.js';
import DestinationsTable from '../../components/admin/destinations/DestinationsTable.jsx';
import DestinationForm from '../../components/admin/destinations/DestinationForm.jsx';
import DestinationFilters from '../../components/admin/destinations/DestinationFilters.jsx';
import DestinationActions from '../../components/admin/destinations/DestinationActions.jsx';
import DestinationCard from '../../components/admin/destinations/DestinationCard.jsx';
import Modal from "../../components/ui/Modal";

const ManageDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const { showToast } = useToast();

  // Fetch destinations
  useEffect(() => {
    fetchDestinations();
  }, [filters]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await destinationService.getAll();
      const allDestinations = response.data || [];
      
      // Apply filters
      let filtered = allDestinations;
      if (filters.search) {
        filtered = filtered.filter(d => 
          d.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.location.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      if (filters.packageType) {
        filtered = filtered.filter(d => d.packageType === filters.packageType);
      }
      if (filters.status) {
        filtered = filtered.filter(d => d.status === filters.status);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(d => d.price <= Number(filters.maxPrice));
      }
      
      setDestinations(filtered);
    } catch (error) {
      showToast('Failed to load destinations', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      if (editingDestination) {
        await destinationService.updateDestination(editingDestination._id, formData);
        showToast('Destination updated successfully!', 'success');
      } else {
        await destinationService.createDestination(formData);
        showToast('Destination created successfully!', 'success');
      }
      setShowForm(false);
      setEditingDestination(null);
      fetchDestinations();
    } catch (error) {
      showToast(error.message || 'Failed to save destination', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (destinations, status) => {
    try {
      await Promise.all(
        destinations.map(dest => 
          destinationService.updateDestination(dest._id, { status })
        )
      );
      showToast(`Updated ${destinations.length} destination(s)`, 'success');
      setSelectedDestinations([]);
      fetchDestinations();
    } catch (error) {
      showToast('Failed to update destinations', 'error');
    }
  };

  const handleBulkDelete = async (destinations) => {
    try {
      await Promise.all(
        destinations.map(dest => 
          destinationService.deleteDestination(dest._id)
        )
      );
      showToast(`Deleted ${destinations.length} destination(s)`, 'success');
      setSelectedDestinations([]);
      fetchDestinations();
    } catch (error) {
      showToast('Failed to delete destinations', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Destinations</h1>
          <p className="text-gray-600">Create and manage tour destinations</p>
        </div>
        <button 
          onClick={() => { setEditingDestination(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Destination
        </button>
      </div>

      {/* Advanced Filters */}
      <DestinationFilters filters={filters} onFiltersChange={setFilters} />

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <DestinationActions
          selectedDestinations={selectedDestinations}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
        />
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-lg ${
              viewMode === 'table' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-2 rounded-lg ${
              viewMode === 'card' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Card View
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <DestinationsTable
          destinations={destinations}
          onEdit={(dest) => { setEditingDestination(dest); setShowForm(true); }}
          onDelete={async (dest) => {
            if (window.confirm(`Delete "${dest.name}"?`)) {
              try {
                await destinationService.deleteDestination(dest._id);
                showToast('Destination deleted!', 'success');
                fetchDestinations();
              } catch (error) {
                showToast('Delete failed', 'error');
              }
            }
          }}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map(destination => (
            <DestinationCard
              key={destination._id}
              destination={destination}
              onEdit={(dest) => { setEditingDestination(dest); setShowForm(true); }}
              onDelete={async (dest) => {
                if (window.confirm(`Delete "${dest.name}"?`)) {
                  try {
                    await destinationService.deleteDestination(dest._id);
                    showToast('Destination deleted!', 'success');
                    fetchDestinations();
                  } catch (error) {
                    showToast('Delete failed', 'error');
                  }
                }
              }}
            />
          ))}
        </div>
      )}

    {/* Form Modal */}
    <Modal 
      isOpen={showForm} 
      onClose={() => { setShowForm(false); setEditingDestination(null); }} 
      title={editingDestination ? "Edit Destination" : "Add New Destination"}
      size="lg"
    >
      <DestinationForm
        destination={editingDestination}
        onSubmit={handleFormSubmit}
        onCancel={() => { setShowForm(false); setEditingDestination(null); }}
        loading={formLoading}
      />
    </Modal>
    </div>
  );
};

export default ManageDestinations;