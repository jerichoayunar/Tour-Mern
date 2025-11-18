/**
 * Centralized reCAPTCHA Hook
 * Eliminates duplicate reCAPTCHA logic across all forms
 */

import { useState, useEffect, useRef } from 'react';
import { RECAPTCHA_SITE_KEY } from '../utils/constants';

const useRecaptcha = () => {
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState('');
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || window.grecaptcha) {
      setRecaptchaReady(true);
      return;
    }

    const loadRecaptcha = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ reCAPTCHA script loaded successfully');
        setRecaptchaReady(true);
        scriptLoaded.current = true;
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load reCAPTCHA script');
        setRecaptchaError('Failed to load security verification');
        setRecaptchaReady(false);
      };
      
      document.head.appendChild(script);
    };

    loadRecaptcha();
  }, []);

  const executeRecaptcha = async (action = 'submit') => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        const error = new Error('reCAPTCHA not loaded');
        setRecaptchaError('Security verification not available');
        reject(error);
        return;
      }

      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
          setRecaptchaError('');
          resolve(token);
        } catch (error) {
          console.error('reCAPTCHA execution error:', error);
          setRecaptchaError('Security verification failed');
          reject(error);
        }
      });
    });
  };

  const clearRecaptchaError = () => setRecaptchaError('');

  return {
    executeRecaptcha,
    recaptchaReady,
    recaptchaError,
    clearRecaptchaError
  };
};

export default useRecaptcha;