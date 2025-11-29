import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';
import { User, Mail, Phone, MapPin, Eye, EyeOff, Camera, Shield } from 'lucide-react';

const Profile = () => {
  const { 
    user, 
    loading, 
    error, 
    success, 
    updateUserProfile, 
    updatePassword, 
    clearMessages 
  } = useProfile();
  
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'security'
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      showToast('Operation completed successfully!', 'success');
      setIsEditing(false);
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      clearMessages();
    }
    
    if (error) {
      showToast(error, 'error');
      clearMessages();
    }
  }, [success, error, showToast, clearMessages]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateUserProfile(profileData);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="page-bg-auth min-h-[calc(100vh-200px)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="p-8 text-center relative bg-gradient-to-tr from-blue-50 to-white">
            <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl relative">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <button aria-label="Edit avatar" className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-gray-600 hover:text-blue-600 transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">{user.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white/30 text-gray-700 text-sm">
              <Shield size={14} className="mr-2" />
              <span className="capitalize">{user.role || 'User'}</span>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 md:p-8 bg-white">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-8">
              <button
                className={`px-4 md:px-6 py-3 font-medium text-sm ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('info')}
              >
                Personal Information
              </button>
              <button
                className={`px-4 md:px-6 py-3 font-medium text-sm ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>
            </div>

            {/* Personal Information Tab */}
            {activeTab === 'info' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-0">Personal Details</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-gray-700 text-sm py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit} className="w-full">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          disabled={!isEditing || loading}
                          className="pl-10 w-full border rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={user.email}
                          disabled={true}
                          className="pl-10 w-full border rounded-lg px-4 py-3 bg-gray-50 text-gray-700 cursor-not-allowed opacity-80"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          disabled={!isEditing || loading}
                          className="pl-10 w-full border rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          disabled={!isEditing || loading}
                          className="pl-10 w-full border rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 justify-end mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({
                            name: user.name || '',
                            phone: user.phone || '',
                            address: user.address || ''
                          });
                        }}
                        className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md flex items-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader size="small" color="white" />
                            <span className="ml-2">Saving...</span>
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-bold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="max-w-lg space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className="w-full pr-10 border rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle current password visibility"
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className="w-full pr-10 border rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Enter new password (min 6 chars)"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle new password visibility"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className="w-full pr-10 border rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader size="small" color="white" />
                          <span className="ml-2">Updating Password...</span>
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
