// src/hooks/useLogin.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecaptcha } from './useRecaptcha';
import { validateLoginForm } from '../utils/authValidators';

export const useLogin = () => {
  const { login, loading, error, clearError } = useAuth();
  const { executeRecaptcha, recaptchaError } = useRecaptcha();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const handleSubmit = async () => {
    // Validate form
    const errors = validateLoginForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return { success: false };
    }

    // Execute reCAPTCHA
    const recaptchaToken = await executeRecaptcha('login');
    if (!recaptchaToken) {
      return { success: false };
    }

    // Perform login
    console.log('🔍 Login attempt debug:', { email: formData.email, hasRecaptcha: !!recaptchaToken, recaptchaLength: recaptchaToken?.length });
    const result = await login({ ...formData, recaptchaToken });
    console.log('🔍 Login result:', result);
    
    if (result.success && rememberMe) {
      // Handle remember me logic
      console.log('Remember me enabled');
    }

    return result;
  };

  return {
    // State
    formData,
    validationErrors,
    showPassword,
    rememberMe,
    loading,
    error,
    recaptchaError,
    
    // Actions
    handleChange,
    handleSubmit,
    setShowPassword,
    setRememberMe,
    
    // Getters
    getFieldValue: (name) => formData[name],
    getFieldError: (name) => validationErrors[name],
  };
};