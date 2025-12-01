import { useState } from 'react';
import { updateProfile, changePassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const useProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateUserProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateProfile(profileData);
      // Response shapes we may receive:
      // 1) Normalized service response: { success: true, data: <user> }
      // 2) Axios-style wrapper: { data: { success: true, data: <user> } }
      // 3) Legacy direct user object: { _id, email, name }
      const resp = response || {};

      let updatedUser = null;

      // Case A: normalized service response
      if (resp.success && resp.data) {
        updatedUser = resp.data;
      }

      // Case B: axios-style wrapper
      else if (resp.data && (resp.data.success || resp.data.data)) {
        const inner = resp.data;
        if (inner.success && inner.data) updatedUser = inner.data;
        else if (inner.data && (inner.data._id || inner.data.email)) updatedUser = inner.data;
      }

      // Case C: direct user object returned
      else if (resp && (resp._id || resp.email)) {
        updatedUser = resp;
      }

      if (updatedUser) {
        setUser(updatedUser);
        setSuccess(true);
        return { success: true, user: updatedUser };
      }

      // In case of non-success, forward message when available
      const message = resp?.message || resp?.data?.message || 'Update failed';
      return { success: false, error: message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await changePassword(passwordData);
      setSuccess(true);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    user,
    loading,
    error,
    success,
    updateUserProfile,
    updatePassword,
    clearMessages,
  };
};

export default useProfile;
