// components/auth/LoginForm.jsx - CLEANER VERSION

/**
 * CLEAN LOGIN FORM WITH SIMPLIFIED SECURITY FEATURES
 * 
 * FEATURES:
 * - Modern UI with SVG icons
 * - Form validation with real-time feedback
 * - Password visibility toggle
 * - Remember me functionality
 * - Google OAuth integration
 * - reCAPTCHA protection
 * - Loading states and error handling
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RECAPTCHA_SITE_KEY } from '../../utils/constants';
import './AuthForms.css';

function LoginForm({ onSwitchToRegister, onClose }) {
  // ======================================================
  // 🔹 HOOKS & CONTEXT
  // ======================================================
  const { login, loading, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  
  // ======================================================
  // 🔹 STATE MANAGEMENT
  // ======================================================
  
  // Form data state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Security state
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');

  // ======================================================
  // 🔹 USE EFFECTS
  // ======================================================

  /**
   * Auto-focus on email field for better UX
   */
  useEffect(() => {
    const emailField = document.querySelector('input[name="email"]');
    if (emailField) {
      emailField.focus();
    }
  }, []);

  /**
   * Load reCAPTCHA script if not already loaded
   */
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // ======================================================
  // 🔹 EVENT HANDLERS
  // ======================================================

  /**
   * Handle input changes with real-time validation clearing
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear global authentication error
    if (authError) clearError();
  };

  /**
   * Comprehensive form validation
   */
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Execute reCAPTCHA verification
   */
  const executeRecaptcha = async () => {
    return new Promise((resolve, reject) => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'login' })
            .then((token) => {
              setRecaptchaToken(token);
              setRecaptchaError('');
              resolve(token);
            })
            .catch((error) => {
              setRecaptchaError('Failed to load reCAPTCHA. Please refresh the page.');
              reject(error);
            });
        });
      } else {
        setRecaptchaError('reCAPTCHA not loaded. Please refresh the page.');
        reject(new Error('reCAPTCHA not loaded'));
      }
    });
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) return;
    
    // Execute reCAPTCHA for security
    try {
      await executeRecaptcha();
    } catch {
      setRecaptchaError('Please complete the security verification');
      return;
    }

    if (!recaptchaToken) {
      setRecaptchaError('Please complete the security verification');
      return;
    }
    
    // Prepare login data with security token
    const loginData = {
      ...formData,
      recaptchaToken
    };
    
    // Attempt login via AuthContext
    const result = await login(loginData);
    
    if (result.success) {
      // Handle remember me preference
      if (rememberMe) {
        console.log('Remember me enabled - would implement persistent session');
      }

      // Redirect to intended page or home
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      navigate(redirectPath);
      localStorage.removeItem("redirectAfterLogin");
      
      // Close modal if provided
      if (onClose) onClose();
    } else {
      // Display the specific error in password field for user clarity
      setValidationErrors(prev => ({
        ...prev,
        password: result.message
      }));
    }
  };

  /**
   * Handle navigation to registration form
   */
  const handleSignUpClick = () => {
    if (!loading && onSwitchToRegister) {
      onSwitchToRegister();
    }
  };

  /**
   * Handle navigation to forgot password page
   */
  const handleForgotPassword = () => {
    if (!loading) {
      navigate('/forgot-password');
    }
  };

  /**
   * Handle Google OAuth login redirect
   */
  const handleGoogleLogin = () => {
    if (!loading) {
      // Store current page to redirect back after login
      localStorage.setItem('preAuthPath', window.location.pathname);
      
      // Redirect to backend Google OAuth endpoint
      // Use Vite env (if provided) and normalize root (strip trailing /api if present)
      const viteApi = import.meta?.env?.VITE_API_URL;
      const backendRoot = viteApi ? viteApi.replace(/\/api\/?$/i, '') : 'http://localhost:5000';
      window.location.href = `${backendRoot}/api/auth/google`;
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ======================================================
  // 🔹 RENDER COMPONENT
  // ======================================================
  return (
    <form className="form modern-form" onSubmit={handleSubmit}>
      
      {/* ================================================== */}
      {/* 🔹 GLOBAL ERROR DISPLAY */}
      {/* ================================================== */}
      {authError && (
            <div className="error-message modern-error">
              {authError}
            </div>
          )}

      {/* ================================================== */}
      {/* 🔹 EMAIL FIELD */}
      {/* ================================================== */}
      <div className="flex-column">
        <label>Email Address</label>
      </div>
      <div className={`inputForm ${validationErrors.email ? 'error' : ''}`}>
        {/* Email SVG Icon */}
        <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
          <g id="Layer_3" data-name="Layer 3">
            <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
          </g>
        </svg>
        <input 
          type="email" 
          className="input" 
          placeholder="Enter your email address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          autoFocus
        />
      </div>
      {/* Email validation error */}
      {validationErrors.email && (
        <span className="field-error modern-field-error">{validationErrors.email}</span>
      )}

      {/* ================================================== */}
      {/* 🔹 PASSWORD FIELD */}
      {/* ================================================== */}
      <div className="flex-column">
        <label>Password</label>
      </div>
      <div className={`inputForm ${validationErrors.password ? 'error' : ''}`}>
        {/* Password SVG Icon */}
        <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
          <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
        </svg>
        <input 
          type={showPassword ? "text" : "password"} 
          className="input" 
          placeholder="Enter your password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
        {/* Password visibility toggle */}
        <button 
          type="button"
          onClick={togglePasswordVisibility}
          className="password-toggle-btn"
          disabled={loading}
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
      {/* Password validation error */}
      {validationErrors.password && (
        <span className="field-error modern-field-error">{validationErrors.password}</span>
      )}

      {/* ================================================== */}
      {/* 🔹 REMEMBER ME & FORGOT PASSWORD */}
      {/* ================================================== */}
      <div className="flex-row" style={{ justifyContent: 'space-between', margin: '15px 0 10px 0', alignItems: 'center' }}>
        <div 
          className="remember-me-container"
          onClick={() => !loading && setRememberMe(!rememberMe)}
        >
          <input 
            type="checkbox" 
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="remember-me-checkbox"
            disabled={loading}
          />
          <label htmlFor="rememberMe" className="remember-me-label">
            Remember me
          </label>
        </div>
        <button 
          type="button" 
          className="link-button" 
          onClick={handleForgotPassword}
          disabled={loading}
        >
          Forgot password?
        </button>
      </div>

      {/* ================================================== */}
      {/* 🔹 reCAPTCHA SECURITY */}
      {/* ================================================== */}
      <div className="recaptcha-container" style={{ margin: '1rem 0' }}>
        <div 
          className="g-recaptcha" 
          data-sitekey={RECAPTCHA_SITE_KEY}
          data-size="invisible"
        ></div>
        {recaptchaError && (
          <span className="field-error modern-field-error" style={{ display: 'block', marginTop: '0.5rem' }}>
            {recaptchaError}
          </span>
        )}
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
          This site is protected by reCAPTCHA and the Google 
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"> Privacy Policy</a> and
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer"> Terms of Service</a> apply.
        </p>
      </div>

      {/* ================================================== */}
      {/* 🔹 SUBMIT BUTTON */}
      {/* ================================================== */}
      <button 
        className="button-submit" 
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <>
            <span style={{ marginRight: '8px' }}>⏳</span>
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* ================================================== */}
      {/* 🔹 SOCIAL LOGIN SEPARATOR */}
      {/* ================================================== */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e1e5e9' }}></div>
        <span style={{ padding: '0 15px', color: '#6b7280', fontSize: '14px' }}>
          Or continue with
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e1e5e9' }}></div>
      </div>

      {/* ================================================== */}
      {/* 🔹 GOOGLE LOGIN BUTTON */}
      {/* ================================================== */}
      <div className="flex-row">
        <button 
          className="btn google" 
          type="button" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg
            version="1.1"
            width="20"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 512 512"
            style={{ enableBackground: 'new 0 0 512 512' }}
            xmlSpace="preserve"
          >
            <path style={{ fill: '#FBBB00' }} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256 c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456 C103.821,274.792,107.225,292.797,113.47,309.408z"></path>
            <path style={{ fill: '#518EF8' }} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451 c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535 c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"></path>
            <path style={{ fill: '#28B446' }} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512 c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771 c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"></path>
            <path style={{ fill: '#F14336' }} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012 c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0 C318.115,0,375.068,22.126,419.404,58.936z"></path>
          </svg>
          Continue with Google
        </button>
      </div>

      {/* ================================================== */}
      {/* 🔹 REGISTRATION LINK */}
      {/* ================================================== */}
      <p className="p">
        Don't have an account?{' '}
        <span 
          className="span" 
          onClick={handleSignUpClick}
          disabled={loading}
          style={{
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          Sign up
        </span>
      </p>
    </form>
  );
}

export default LoginForm;