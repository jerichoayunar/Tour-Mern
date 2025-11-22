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
      // Normalize axios/legacy responses: prefer response.data when present
      const resp = response?.data ?? response;
      // Backend/services normalized to: { success, data: <user>, message }
      if (resp?.success) {
        const updatedUser = resp.data ?? resp;
        setUser(updatedUser);
        setSuccess(true);
        return { success: true, user: updatedUser };
      }
      // In case of non-success, forward message
      return { success: false, error: resp?.message || 'Update failed' };
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
