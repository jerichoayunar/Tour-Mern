import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import destinationService from '../../services/destinationService.js';
import DestinationsTable from '../../components/admin/destinations/DestinationsTable.jsx';
import DestinationForm from '../../components/admin/destinations/DestinationForm.jsx';
import DestinationFilters from '../../components/admin/destinations/DestinationFilters.jsx';
import DestinationActions from '../../components/admin/destinations/DestinationActions.jsx';
import DestinationCard from '../../components/admin/destinations/DestinationCard.jsx';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
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
  const [showArchived, setShowArchived] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null
  });

  // Fetch destinations
  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await destinationService.getAll({ onlyArchived: showArchived ? 'true' : undefined });
      const resp = response?.data ?? response;
      const allDestinations = Array.isArray(resp)
        ? resp
        : (resp && resp.success !== undefined)
          ? (Array.isArray(resp.data) ? resp.data : [])
          : (Array.isArray(resp?.data) ? resp.data : []);
      
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
      console.debug('fetchDestinations error:', error);
      showToast('Failed to load destinations', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast, showArchived]);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

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
      console.debug('handleFormSubmit error:', error);
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
      console.debug('handleBulkStatusChange error:', error);
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
      console.debug('handleBulkDelete error:', error);
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
        <div className="flex flex-col items-end">
          <button 
            onClick={() => { setEditingDestination(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Destination
          </button>
          <div className="mt-2">
            <button
              onClick={() => setShowArchived(prev => !prev)}
              className={`px-3 py-2 rounded-lg ${showArchived ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              {showArchived ? 'View Active' : 'View Archived'}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <DestinationFilters filters={filters} onFiltersChange={setFilters} />

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <DestinationActions
          selectedDestinations={selectedDestinations}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          onBulkDeleteRequest={(selected) => setConfirmationModal({
            isOpen: true,
            type: 'danger',
            title: 'Delete Selected Destinations',
            message: `Permanently delete ${selected.length} destination(s)? This cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: async () => {
              try {
                await handleBulkDelete(selected);
              } catch (err) {
                console.debug('bulk delete error:', err);
                showToast('Failed to delete selected destinations', 'error');
              }
            }
          })}
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
          isArchived={showArchived}
          onArchive={(dest) => setConfirmationModal({
            isOpen: true,
            type: 'warning',
            title: 'Archive Destination',
            message: `Are you sure you want to archive "${dest.name}"?`,
            confirmText: 'Archive',
            onConfirm: async () => {
              try {
                await destinationService.archiveDestination(dest._id);
                showToast('Destination archived', 'success');
                fetchDestinations();
              } catch (err) {
                console.debug('archive error (table):', err);
                showToast(err?.message || 'Failed to archive destination', 'error');
              }
            }
          })}
          onRestore={(dest) => setConfirmationModal({
            isOpen: true,
            type: 'info',
            title: 'Restore Destination',
            message: `Restore "${dest.name}" back to active destinations?`,
            confirmText: 'Restore',
            onConfirm: async () => {
              try {
                await destinationService.restoreDestination(dest._id);
                showToast('Destination restored', 'success');
                fetchDestinations();
              } catch (err) {
                console.debug('restore error (table):', err);
                showToast(err?.message || 'Failed to restore destination', 'error');
              }
            }
          })}
          onDeletePermanent={(dest) => setConfirmationModal({
            isOpen: true,
            type: 'danger',
            title: 'Permanently Delete Destination',
            message: `This will permanently delete "${dest.name}" and cannot be undone. Continue?`,
            confirmText: 'Delete Forever',
            onConfirm: async () => {
              try {
                await destinationService.deleteDestinationPermanent(dest._id);
                showToast('Destination permanently deleted', 'success');
                fetchDestinations();
              } catch (err) {
                console.debug('permanent delete error (table):', err);
                showToast(err?.message || 'Failed to delete destination', 'error');
              }
            }
          })}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map(destination => (
            <DestinationCard
              key={destination._id}
              destination={destination}
              onEdit={(dest) => { setEditingDestination(dest); setShowForm(true); }}
              isArchived={showArchived}
              onArchive={(dest) => setConfirmationModal({
                isOpen: true,
                type: 'warning',
                title: 'Archive Destination',
                message: `Are you sure you want to archive "${dest.name}"?`,
                confirmText: 'Archive',
                onConfirm: async () => {
                  try {
                    await destinationService.archiveDestination(dest._id);
                    showToast('Destination archived', 'success');
                    fetchDestinations();
                  } catch (err) {
                    console.debug('archive error (card):', err);
                    showToast('Failed to archive destination', 'error');
                  }
                }
              })}
              onRestore={(dest) => setConfirmationModal({
                isOpen: true,
                type: 'info',
                title: 'Restore Destination',
                message: `Restore "${dest.name}" back to active destinations?`,
                confirmText: 'Restore',
                onConfirm: async () => {
                  try {
                    await destinationService.restoreDestination(dest._id);
                    showToast('Destination restored', 'success');
                    fetchDestinations();
                  } catch (err) {
                    console.debug('restore error (card):', err);
                    showToast('Failed to restore destination', 'error');
                  }
                }
              })}
              onDeletePermanent={(dest) => setConfirmationModal({
                isOpen: true,
                type: 'danger',
                title: 'Permanently Delete Destination',
                message: `This will permanently delete "${dest.name}" and cannot be undone. Continue?`,
                confirmText: 'Delete Forever',
                onConfirm: async () => {
                  try {
                    await destinationService.deleteDestinationPermanent(dest._id);
                    showToast('Destination permanently deleted', 'success');
                    fetchDestinations();
                  } catch (err) {
                    console.debug('permanent delete error (card):', err);
                    showToast('Failed to delete destination', 'error');
                  }
                }
              })}
            />
          ))}
        </div>
      )}

    {/* Form Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
          confirmText={confirmationModal.confirmText}
        />
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