import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';
import { User, Mail, Phone, MapPin, Eye, EyeOff, Camera, Shield } from 'lucide-react';
import './Profile.css';

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
    <div className="profile-container">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="profile-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                alt={user.name} 
                className="w-full h-full object-cover rounded-full"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-gray-600 hover:text-blue-600 transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-sm backdrop-blur-sm">
              <Shield size={14} className="mr-2" />
              <span className="capitalize">{user.role || 'User'}</span>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === 'info' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Personal Information
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === 'security' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>
            </div>

            {/* Personal Information Tab */}
            {activeTab === 'info' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="profile-section-title mb-0 border-none">Personal Details</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          disabled={!isEditing || loading}
                          className="form-input pl-10 w-full"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={user.email}
                          disabled={true}
                          className="form-input pl-10 w-full opacity-70 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          disabled={!isEditing || loading}
                          className="form-input pl-10 w-full"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          disabled={!isEditing || loading}
                          className="form-input pl-10 w-full"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="profile-actions">
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
                        className="btn-secondary"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary flex items-center"
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
              <div className="animate-fadeIn">
                <h2 className="profile-section-title">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="profile-form max-w-lg">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className="form-input w-full pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className="form-input w-full pr-10"
                        placeholder="Enter new password (min 6 chars)"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className="form-input w-full pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-actions justify-start">
                    <button 
                      type="submit" 
                      className="btn-primary flex items-center"
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
