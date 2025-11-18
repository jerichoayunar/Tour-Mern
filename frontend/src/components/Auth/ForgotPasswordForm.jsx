  // components/Auth/ForgotPasswordForm.jsx
  import { useState, useEffect, useRef } from 'react';
  import { Link } from 'react-router-dom';
  import { authService } from '../../services/authService';
  import { RECAPTCHA_SITE_KEY } from '../../utils/constants';
  import './AuthForms.css';

  function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [recaptchaError, setRecaptchaError] = useState('');
    const recaptchaLoaded = useRef(false);

    // reCAPTCHA loading
    useEffect(() => {
      if (recaptchaLoaded.current || window.grecaptcha) return;

      console.log('🔍 Loading reCAPTCHA v3 script...');
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('🔍 reCAPTCHA v3 script loaded');
        recaptchaLoaded.current = true;
      };
      
      script.onerror = () => {
        console.error('🔍 Failed to load reCAPTCHA script');
        setRecaptchaError('Failed to load security verification. Please refresh the page.');
      };
      
      document.head.appendChild(script);
    }, []);

    // Execute reCAPTCHA
    const executeRecaptcha = () => {
      return new Promise((resolve, reject) => {
        console.log('🔍 Starting reCAPTCHA execution...');
        
        if (!window.grecaptcha) {
          const error = new Error('reCAPTCHA not loaded');
          console.error('🔍 reCAPTCHA not available');
          reject(error);
          return;
        }

        try {
          window.grecaptcha.ready(async () => {
            try {
              console.log('🔍 reCAPTCHA ready, executing...');
              const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
                action: 'forgot_password'
              });
              
              console.log('🔍 reCAPTCHA token received:', token ? `YES (${token.length} chars)` : 'NO');
              
              if (token) {
                resolve(token);
              } else {
                reject(new Error('No token received from reCAPTCHA'));
              }
            } catch (error) {
              console.error('🔍 reCAPTCHA execution error:', error);
              reject(error);
            }
          });
        } catch (error) {
          console.error('🔍 reCAPTCHA ready error:', error);
          reject(error);
        }
      });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setMessage('');
      setRecaptchaError('');

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      setLoading(true);

      try {
        console.log('🔍 === FRONTEND DEBUG START ===');
        console.log('🔍 1. Email:', email);
        console.log('🔍 2. Getting reCAPTCHA token...');
        
        const recaptchaToken = await executeRecaptcha();
        
        console.log('🔍 3. Token received, making API call...');
        
        const response = await authService.forgotPassword({ 
          email, 
          recaptchaToken 
        });
        
        console.log('🔍 4. API Response:', response);
        
        if (response.success) {
          setMessage(response.message || 'Password reset email sent successfully!');
          setEmail('');
        } else {
          setError(response.message || 'Failed to send reset email.');
        }
      } catch (error) {
        console.error('🔍 5. Error in handleSubmit:', error);
        
        if (error.message.includes('reCAPTCHA')) {
          setRecaptchaError('Security verification failed. Please refresh the page and try again.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      } finally {
        setLoading(false);
        console.log('🔍 === FRONTEND DEBUG END ===');
      }
    };

    const handleChange = (e) => {
      setEmail(e.target.value);
      if (error) setError('');
      if (recaptchaError) setRecaptchaError('');
    };

    return (
      <form className="form modern-form" onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
          <p className="text-gray-600 mt-2">
            Enter your email address and we'll send you reset instructions
          </p>
        </div>

        {/* Global Error Message */}
        {error && (
          <div className="error-message modern-error">
            {error}
          </div>
        )}

        {/* reCAPTCHA Error Message */}
        {recaptchaError && (
          <div className="error-message modern-error">
            {recaptchaError}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="success-message modern-success">
            {message}
          </div>
        )}

        {/* EMAIL FIELD */}
        <div className="flex-column">
          <label>Email Address</label>
        </div>
        <div className="inputForm">
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
            value={email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* reCAPTCHA Notice */}
        <div className="recaptcha-container" style={{ margin: '1.5rem 0 1rem 0' }}>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
            This site is protected by reCAPTCHA and the Google 
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"> Privacy Policy</a> and
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer"> Terms of Service</a> apply.
          </p>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          className="button-submit" 
          type="submit"
          disabled={loading}
          style={{ marginTop: '10px' }}
        >
          {loading ? (
            <>
              <span style={{ marginRight: '8px' }}>⏳</span>
              Sending...
            </>
          ) : (
            'Send Reset Instructions'
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
            Return to login
          </Link>
        </p>
      </form>
    );
  }

  export default ForgotPasswordForm;