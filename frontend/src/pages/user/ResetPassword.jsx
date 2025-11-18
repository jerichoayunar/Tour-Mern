// pages/ResetPassword.jsx - CLEAN VERSION
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResetPasswordForm from '../../components/Auth/ResetPasswordForm';
import './AuthPages.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');

  // Get token from URL when component loads
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      console.log('🔑 Reset token from URL:', urlToken);
    }
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;