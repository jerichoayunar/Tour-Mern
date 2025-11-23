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

  // UPDATED: Package statistics with ONLY day-specific inclusion calculations
  const packageStats = {
    // Basic counts
    total: packagesList.length,
    active: packagesList.filter(p => p.status === 'active').length,
    
    // Day-specific inclusion statistics
    daysWithTransport: packagesList.reduce((sum, pkg) => 
      sum + (pkg.itinerary?.filter(day => day.inclusions?.transport).length || 0), 0),
    daysWithMeals: packagesList.reduce((sum, pkg) => 
      sum + (pkg.itinerary?.filter(day => day.inclusions?.meals).length || 0), 0),
    daysWithStay: packagesList.reduce((sum, pkg) => 
      sum + (pkg.itinerary?.filter(day => day.inclusions?.stay).length || 0), 0),
    
    // Packages that have at least one day with each inclusion
    packagesWithSomeTransport: packagesList.filter(pkg => 
      pkg.itinerary?.some(day => day.inclusions?.transport)).length,
    packagesWithSomeMeals: packagesList.filter(pkg => 
      pkg.itinerary?.some(day => day.inclusions?.meals)).length,
    packagesWithSomeStay: packagesList.filter(pkg => 
      pkg.itinerary?.some(day => day.inclusions?.stay)).length,
    
    // Financial statistics
    totalValue: packagesList.reduce((sum, pkg) => sum + (pkg.price || 0), 0),
    averagePrice: packagesList.length > 0 ? 
      packagesList.reduce((sum, pkg) => sum + (pkg.price || 0), 0) / packagesList.length : 0,
    
    // Itinerary statistics
    totalItineraryDays: packagesList.reduce((sum, pkg) => sum + (pkg.itinerary?.length || 0), 0),
    averageDaysPerPackage: packagesList.length > 0 ? 
      packagesList.reduce((sum, pkg) => sum + (pkg.itinerary?.length || 0), 0) / packagesList.length : 0
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
            Create and manage your tour packages with day-specific inclusions. All prices in Philippine Peso (₱).
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

      {/* UPDATED: Stats Summary with ONLY Day-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Packages */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{packageStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📦</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {packageStats.active} active • {packageStats.totalItineraryDays} total days
          </div>
        </div>

        {/* Portfolio Value */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(packageStats.totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Avg: {formatPrice(packageStats.averagePrice)} per package
          </div>
        </div>

        {/* Transport Coverage */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transport Days</p>
              <p className="text-2xl font-bold text-purple-600">{packageStats.daysWithTransport}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">🚗</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {packageStats.packagesWithSomeTransport} packages • {Math.round((packageStats.daysWithTransport / packageStats.totalItineraryDays) * 100) || 0}% coverage
          </div>
        </div>

        {/* Comprehensive Packages */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Full Experience</p>
              <p className="text-2xl font-bold text-orange-600">
                {packageStats.packagesWithSomeTransport && 
                 packageStats.packagesWithSomeMeals && 
                 packageStats.packagesWithSomeStay ? 
                 Math.min(packageStats.packagesWithSomeTransport, packageStats.packagesWithSomeMeals, packageStats.packagesWithSomeStay) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⭐</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Packages with transport, meals & stay
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Meals Coverage */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meals Included</p>
              <p className="text-2xl font-bold text-yellow-600">{packageStats.daysWithMeals} days</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-lg">🍽️</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {packageStats.packagesWithSomeMeals} packages include meals
          </div>
        </div>

        {/* Stay Coverage */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accommodation</p>
              <p className="text-2xl font-bold text-indigo-600">{packageStats.daysWithStay} nights</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 text-lg">🏨</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {packageStats.packagesWithSomeStay} packages include stay
          </div>
        </div>

        {/* Average Itinerary */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Itinerary</p>
              <p className="text-2xl font-bold text-teal-600">
                {packageStats.averageDaysPerPackage.toFixed(1)} days
              </p>
            </div>
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <span className="text-teal-600 text-lg">📅</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {packageStats.totalItineraryDays} total planned days
          </div>
        </div>
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