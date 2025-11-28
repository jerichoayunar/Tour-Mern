// src/pages/admin/ManagePackages.jsx - REMOVED GLOBAL INCLUSIONS
import React, { useEffect, useState, useCallback } from "react";
import { 
  getPackages, 
  createPackage, 
  updatePackage, 
  deletePackage,
  archivePackage,
  restorePackage,
  deletePackagePermanent
} from "../../services/packageService";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Loader from "../../components/ui/Loader";
import PackageTable from "../../components/admin/packages/PackageTable";
import PackageForm from "../../components/admin/packages/PackageForm";

const ManagePackages = () => {
  const { showToast } = useToast();

  // ------------------ STATE MANAGEMENT ------------------
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showArchived, setShowArchived] = useState(false); // 📦 ARCHIVE STATE
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null
  });

  // Format currency function for Philippine Peso
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  // Ensure we always operate on an array (services may return normalized {data: []})
  const packagesList = Array.isArray(packages) ? packages : (Array.isArray(packages?.data) ? packages.data : []);

  // Compact package statistics used by the compact summary
  const packageStats = {
    total: packagesList.length,
    active: packagesList.filter(p => p.status === 'active').length,
    totalItineraryDays: packagesList.reduce((sum, pkg) => sum + (pkg.itinerary?.length || 0), 0)
  };

  // ------------------ DATA FETCHING ------------------
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching ${showArchived ? 'archived' : 'active'} packages...`);
      // Pass archived filter
      const response = await getPackages({ onlyArchived: showArchived });
      const resp = response?.data ?? response;
      console.log('✅ Packages data:', resp);
      // Normalize to array: support raw array, { success, data } or axios response
      const packagesData = Array.isArray(resp)
        ? resp
        : (resp && resp.success !== undefined)
          ? (Array.isArray(resp.data) ? resp.data : [])
          : (Array.isArray(resp?.data) ? resp.data : []);
      setPackages(packagesData);
    } catch (error) {
      console.error('❌ Packages error:', error);
      showToast(error.message || "Failed to fetch packages", "error");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [showArchived, showToast]);

  // Fetch packages on component mount or when archive mode changes
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // ------------------ CRUD OPERATIONS ------------------
  const handleSave = async (formData) => {
    try {
      setLoading(true);
      console.log('💾 Saving package:', formData);

      let response;
      if (editingPackage) {
        response = await updatePackage(editingPackage._id, formData);
        showToast("Package updated successfully", "success");
      } else {
        response = await createPackage(formData);
        showToast("Package created successfully", "success");
      }

      console.log('✅ Save response:', response);
      setModalOpen(false);
      setEditingPackage(null);
      fetchPackages(); // Refresh the list
    } catch (error) {
      console.error('❌ Save error:', error);
      showToast(error.message || "Error saving package", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Package',
      message: 'Are you sure you want to delete this package? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          setLoading(true);
          await deletePackage(id);
          showToast("Package deleted successfully", "success");
          fetchPackages();
        } catch (error) {
          showToast(error.message || "Error deleting package", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPackage(null);
    setModalOpen(true);
  };

  // Archive Package
  const handleArchive = async (pkg) => {
    setConfirmationModal({
      isOpen: true,
      type: 'warning',
      title: 'Archive Package',
      message: `Are you sure you want to archive "${pkg.title}"?`,
      confirmText: 'Archive',
      onConfirm: async () => {
        try {
          setLoading(true);
          await archivePackage(pkg._id);
          showToast("Package archived successfully", "success");
          fetchPackages();
        } catch (error) {
          showToast(error.message || "Failed to archive package", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Restore Package
  const handleRestore = async (pkg) => {
    try {
      setLoading(true);
      await restorePackage(pkg._id);
      showToast("Package restored successfully", "success");
      fetchPackages();
    } catch (error) {
      showToast(error.message || "Failed to restore package", "error");
    } finally {
      setLoading(false);
    }
  };

  // Permanent Delete
  const handleDeletePermanent = async (pkg) => {
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Permanently Delete Package',
      message: `⚠️ WARNING: This will PERMANENTLY delete "${pkg.title}". This action CANNOT be undone. Continue?`,
      confirmText: 'Delete Forever',
      onConfirm: async () => {
        try {
          setLoading(true);
          await deletePackagePermanent(pkg._id);
          showToast("Package permanently deleted", "success");
          fetchPackages();
        } catch (error) {
          showToast(error.message || "Failed to delete package", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // ------------------ RENDER COMPONENT ------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Tour Packages</h1>
          <p className="text-gray-600">
            Create and manage your tour packages with day-specific inclusions.
          </p>
        </div>
        <Button 
          onClick={handleAdd} 
          className="flex items-center space-x-2 mt-4 lg:mt-0 px-6"
          variant="primary"
        >
          <span className="text-lg">+</span>
          <span>Add New Package</span>
        </Button>
      </div>

      {/* Archive Toggle */}
      <div className="flex justify-end mb-4">
        <Button
          variant={showArchived ? "primary" : "outline"}
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center space-x-2"
        >
          <span>{showArchived ? '📂' : '📦'}</span>
          <span>{showArchived ? 'View Active' : 'View Archived'}</span>
        </Button>
      </div>

      {/* Compact summary (stats removed for cleaner admin view) */}
      <div className="mb-6 text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-800">{packageStats.total}</span> packages • <span className="font-semibold text-gray-800">{packageStats.active}</span> active • <span className="font-semibold text-gray-800">{packageStats.totalItineraryDays}</span> total days
      </div>

      {/* Packages Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader size="large" />
          <p className="text-gray-600 mt-4">Loading packages...</p>
        </div>
      ) : (
        <PackageTable 
          data={packagesList} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          isArchived={showArchived}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDeletePermanent={handleDeletePermanent}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingPackage ? "Edit Package" : "Add New Package"}
        size="lg"
      >
        <PackageForm
          initialData={editingPackage}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
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

export default ManagePackages;