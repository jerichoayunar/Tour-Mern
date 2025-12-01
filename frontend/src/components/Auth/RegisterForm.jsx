// components/auth/RegisterForm.jsx - MODERN DESIGN

/**
 * REGISTER FORM COMPONENT - MODERN DESIGN
 * 
 * WHAT THIS DOES:
 * - Beautiful modern registration form matching login design
 * - Complete user registration with all required fields
 * - Philippine phone number validation with SVG icons
 * - Password confirmation and strength checking
 * - Auto-login after successful registration
 * - Uses toast notifications for user feedback
 * 
 * MATCHES YOUR BACKEND:
 * - Requires: name, email, password, phone, address
 * - Phone format: 09XXXXXXXXX or +639XXXXXXXXX
 * - Auto-returns user data + token on success
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RECAPTCHA_SITE_KEY } from '../../utils/constants';
import PasswordStrength from '../Common/PasswordStrength';
import './AuthForms.css';

function RegisterForm({ onSwitchToLogin, onClose }) {
  const { register, loading, error, clearError, operationLoading } = useAuth();
  const _navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [_recaptchaToken, _setRecaptchaToken] = useState('');
  const [_recaptchaError, _setRecaptchaError] = useState('');

  // ✅ Get specific loading state
  const isRegistering = operationLoading?.register || loading;

  // Auto-focus on name field when component mounts
  useEffect(() => {
    const nameField = document.querySelector('input[name="name"]');
    if (nameField) {
      nameField.focus();
    }
  }, []);

  // Load reCAPTCHA script
  useEffect(() => {
    const loadRecaptcha = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ reCAPTCHA script loaded successfully');
        console.log('🔍 grecaptcha available:', typeof window.grecaptcha !== 'undefined');
      };
      script.onerror = () => {
        console.error('❌ Failed to load reCAPTCHA script');
      };
      document.head.appendChild(script);
    };

    loadRecaptcha();
  }, []);

  // Handle input changes with real-time validation clearing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear global error
    if (error) clearError();
  };

  // Validate Philippine phone number
  const validatePhone = (phone) => {
    const cleanedPhone = phone.replace(/\s+/g, '');
    return /^(09|\+639)\d{9}$/.test(cleanedPhone);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Include lowercase, uppercase letters and numbers';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Phone validation
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX)';
    }
    
    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Please enter a complete address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Execute reCAPTCHA
  const executeRecaptcha = async () => {
    return new Promise((resolve, reject) => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'register' })
            .then((token) => {
              _setRecaptchaToken(token);
              _setRecaptchaError('');
              resolve(token);
            })
            .catch((error) => {
              _setRecaptchaError('Failed to load reCAPTCHA. Please refresh the page.');
              reject(error);
            });
        });
      } else {
        _setRecaptchaError('reCAPTCHA not loaded. Please refresh the page.');
        reject(new Error('reCAPTCHA not loaded'));
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    _setRecaptchaError('');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    try {
      console.log('🔍 Starting registration process...');
      
      // Get reCAPTCHA token
      console.log('🔍 Getting reCAPTCHA token...');
      const token = await executeRecaptcha();
      console.log('🔍 reCAPTCHA token received:', token ? `YES (${token.length} chars)` : 'NO');
      
      if (!token) {
        throw new Error('No reCAPTCHA token received');
      }

      // Prepare data for backend
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        recaptchaToken: token
      };
      
      console.log('🔍 Registration data prepared:', {
        name: submitData.name,
        email: submitData.email,
        phone: submitData.phone,
        hasRecaptcha: !!submitData.recaptchaToken
      });
      
      console.log('🔍 Calling register function...');
      
      // Call register
      const result = await register(submitData);
      
      console.log('🔍 Register result:', result);
      
      if (result && result.success) {
        console.log('✅ Registration successful!');
        // ✅ MODAL WILL CLOSE AUTOMATICALLY VIA onClose
        // ✅ TOAST WILL SHOW VIA AuthContext
        if (onClose) onClose();
      }
      
    } catch (error) {
      console.error('🔍 Registration error:', error);
      
      if (error.message.includes('reCAPTCHA')) {
        _setRecaptchaError('Security verification failed. Please refresh and try again.');
      }
    }
  };

  // Handle Login navigation
  const handleLoginClick = () => {
    if (!isRegistering && onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form className="form modern-form" onSubmit={handleSubmit}>
      {/* Global Error Message */}
      {error && (
        <div className="error-message modern-error">
          {error}
        </div>
      )}
      
      <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#2d3748', fontSize: '1.8rem', fontWeight: '700' }}>
        Create Account
      </h2>
      <p style={{ textAlign: 'center', color: '#718096', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Join our tour community today!
      </p>
      
      {/* NAME FIELD */}
      <div className="flex-column">
        <label>Full Name</label>
      </div>
      <div className={`inputForm ${validationErrors.name ? 'error' : ''}`}>
        <svg
          height="20"
          viewBox="0 0 24 24"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="#6b7280"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <input 
          type="text" 
          className="input" 
          placeholder="Enter your full name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isRegistering}
          autoFocus
        />
      </div>
      {validationErrors.name && (
        <span className="field-error modern-field-error">{validationErrors.name}</span>
      )}

      {/* EMAIL FIELD */}
      <div className="flex-column">
        <label>Email Address</label>
      </div>
      <div className={`inputForm ${validationErrors.email ? 'error' : ''}`}>
        <svg
          height="20"
          viewBox="0 0 32 32"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="Layer_3" data-name="Layer 3">
            <path
              d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"
            ></path>
          </g>
        </svg>
        <input 
          type="email" 
          className="input" 
          placeholder="Enter your email address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isRegistering}
        />
      </div>
      {validationErrors.email && (
        <span className="field-error modern-field-error">{validationErrors.email}</span>
      )}

      {/* PHONE FIELD */}
      <div className="flex-column">
        <label>Phone Number</label>
      </div>
      <div className={`inputForm ${validationErrors.phone ? 'error' : ''}`}>
        <svg
          height="20"
          viewBox="0 0 24 24"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="#6b7280"
        >
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        <input 
          type="tel" 
          className="input" 
          placeholder="09XXXXXXXXX or +639XXXXXXXXX"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={isRegistering}
        />
      </div>
      {validationErrors.phone && (
        <span className="field-error modern-field-error">{validationErrors.phone}</span>
      )}

      {/* ADDRESS FIELD */}
      <div className="flex-column">
        <label>Complete Address</label>
      </div>
      <div className={`inputForm ${validationErrors.address ? 'error' : ''}`} style={{ height: 'auto', minHeight: '80px', alignItems: 'flex-start', paddingTop: '10px' }}>
        <svg
          height="20"
          viewBox="0 0 24 24"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="#6b7280"
          style={{ marginTop: '5px' }}
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <textarea 
          className="input" 
          placeholder="Enter your complete address (street, city, province)"
          name="address"
          value={formData.address}
          onChange={handleChange}
          disabled={isRegistering}
          rows="3"
          style={{ 
            border: 'none', 
            outline: 'none', 
            width: '85%', 
            minHeight: '60px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>
      {validationErrors.address && (
        <span className="field-error modern-field-error">{validationErrors.address}</span>
      )}


      {/* PASSWORD FIELD WITH STRENGTH METER */}
      <div className="flex-column">
        <label>Password</label>
      </div>
      <div className={`inputForm ${validationErrors.password ? 'error' : ''}`}>
        <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
          <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
        </svg>
        
        <input 
          type={showPassword ? "text" : "password"} 
          className="input" 
          placeholder="Create a strong password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={isRegistering}
        />
        
        <button 
          type="button"
          onClick={togglePasswordVisibility}
          className="password-toggle-btn"
          disabled={isRegistering}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.9 4.24C10.5883 4.07888 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1962C9.51903 13.9113 9.29444 13.5719 9.14351 13.1984C8.99258 12.8248 8.91852 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58534 10.1546 9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68189 3.96914 7.6566 6.06 6.06" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* ✅ ADD PASSWORD STRENGTH COMPONENT HERE */}
      {formData.password && (
        <PasswordStrength password={formData.password} />
      )}

      {validationErrors.password && (
        <span className="field-error modern-field-error">{validationErrors.password}</span>
      )}

      {/* CONFIRM PASSWORD FIELD */}
      <div className="flex-column">
        <label>Confirm Password</label>
      </div>
      <div className={`inputForm ${validationErrors.confirmPassword ? 'error' : ''}`}>
        <svg
          height="20"
          viewBox="-64 0 512 512"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"
          ></path>
          <path
            d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"
          ></path>
        </svg>
        <input 
          type={showConfirmPassword ? "text" : "password"} 
          className="input" 
          placeholder="Confirm your password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isRegistering}
        />
        <button 
          type="button"
          onClick={toggleConfirmPasswordVisibility}
          className="password-toggle-btn"
          disabled={isRegistering}
        >
          {showConfirmPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.9 4.24C10.5883 4.07888 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1962C9.51903 13.9113 9.29444 13.5719 9.14351 13.1984C8.99258 12.8248 8.91852 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58534 10.1546 9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68189 3.96914 7.6566 6.06 6.06" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      {validationErrors.confirmPassword && (
        <span className="field-error modern-field-error">{validationErrors.confirmPassword}</span>
      )}

      {/* reCAPTCHA NOTICE */}
      <div style={{ margin: '1rem 0', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          Protected by reCAPTCHA - Google's 
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"> Privacy Policy</a> and
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer"> Terms of Service</a> apply.
        </p>
      </div>

      {/* SUBMIT BUTTON */}
      <button 
        className="button-submit" 
        type="submit"
        disabled={isRegistering}
      >
        {isRegistering ? (
          <>
            <span style={{ marginRight: '8px' }}>⏳</span>
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* SWITCH TO LOGIN */}
      <p className="p">
        Already have an account?{' '}
        <span 
          className="span" 
          onClick={handleLoginClick}
          style={{ 
            cursor: isRegistering ? 'not-allowed' : 'pointer', 
            opacity: isRegistering ? 0.6 : 1 
          }}
        >
          Sign in
        </span>
      </p>
    </form>
  );
}

export default RegisterForm;