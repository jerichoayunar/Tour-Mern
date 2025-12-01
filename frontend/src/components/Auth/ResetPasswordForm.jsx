// components/Auth/ResetPasswordForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './AuthForms.css';

function ResetPasswordForm({ token, onTokenError: _onTokenError }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    if (!token) {
      setError('No reset token found. Please request a new password reset.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Sending reset request with token:', token);
      const response = await authService.resetPassword({
        token: token,
        newPassword: formData.newPassword
      });

      console.log('✅ Reset response:', response);

      if (response.success) {
        setMessage('Password reset successfully! You can now login with your new password.');
        setFormData({ newPassword: '', confirmPassword: '' });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Enhanced password toggle button with proper styling
  const PasswordToggleButton = ({ showPassword, onClick, disabled }) => (
    <button 
      type="button"
      onClick={onClick}
      className="password-toggle-btn"
      disabled={disabled}
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
  );

  if (!token) {
    return (
      <div className="text-center">
        <p className="error-message modern-error">Invalid reset link</p>
        <Link
          to="/forgot-password"
          className="span"
          style={{ cursor: 'pointer', display: 'inline-block', marginTop: '1rem' }}
        >
          Request a new password reset
        </Link>
      </div>
    );
  }

  return (
    <form className="form modern-form" onSubmit={handleSubmit}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
        <p className="text-gray-600 mt-2">Enter your new password below</p>
      </div>

      {/* Global Error Message */}
      {error && (
        <div className="error-message modern-error">
          {error}
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div className="success-message modern-success">
          {message}
        </div>
      )}

      {/* NEW PASSWORD FIELD */}
      <div className="flex-column">
        <label>New Password</label>
      </div>
      <div className="inputForm">
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
          type={showPassword ? "text" : "password"} 
          className="input" 
          placeholder="Enter new password (min 6 characters)"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          disabled={loading}
        />
        <PasswordToggleButton 
          showPassword={showPassword}
          onClick={() => togglePasswordVisibility('password')}
          disabled={loading}
        />
      </div>

      {/* CONFIRM PASSWORD FIELD */}
      <div className="flex-column" style={{ marginTop: '15px' }}>
        <label>Confirm New Password</label>
      </div>
      <div className="inputForm">
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
          placeholder="Confirm your new password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />
        <PasswordToggleButton 
          showPassword={showConfirmPassword}
          onClick={() => togglePasswordVisibility('confirm')}
          disabled={loading}
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button 
        className="button-submit" 
        type="submit"
        disabled={loading}
        style={{ marginTop: '20px' }}
      >
        {loading ? (
          <>
            <span style={{ marginRight: '8px' }}>⏳</span>
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </button>

      {/* BACK TO LOGIN LINK */}
      <p className="p" style={{ marginTop: '15px' }}>
        Remember your password?{' '}
        <Link 
          to="/login" 
          className="span"
          style={{ cursor: 'pointer' }}
        >
          Back to Login
        </Link>
      </p>
    </form>
  );
}

export default ResetPasswordForm;