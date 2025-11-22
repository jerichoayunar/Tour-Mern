// src/pages/user/AuthSuccess.jsx - FIXED VERSION
import { useEffect, useRef } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthSuccess() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      console.log('🛑 OAuth already processed - stopping');
      return;
    }

    const handleAuthSuccess = async () => {
      try {
        hasProcessed.current = true;
        
        const token = searchParams.get('token');
        const userData = searchParams.get('user');

        console.log('🔄 OAuth Callback - Processing response...');

        if (token && userData) {
          console.log('✅ OAuth Success - Storing token and user data...');
          
          localStorage.setItem('token', token);
          
          const user = JSON.parse(decodeURIComponent(userData));
          console.log('✅ OAuth User:', user);
          
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          
          // ✅ FIXED: Redirect based on user role
          let redirectPath = '/';
          if (user.role === 'admin') {
            redirectPath = '/admin/dashboard';
          } else {
            redirectPath = '/profile'; // Or wherever regular users should go
          }
          
          // Check if there was an intended path before auth
          const intendedPath = localStorage.getItem('preAuthPath');
          if (intendedPath && intendedPath !== '/login' && intendedPath !== '/register') {
            redirectPath = intendedPath;
            localStorage.removeItem('preAuthPath');
          }
          
          console.log('🔄 Redirecting to:', redirectPath);
          navigate(redirectPath, { replace: true });
        } else {
          console.error('❌ Missing token or user data in URL');
          navigate('/login', { replace: true, state: { error: 'Authentication failed' } });
        }
      } catch (error) {
        console.error('❌ Auth success handling error:', error);
        navigate('/login', { replace: true, state: { error: 'Authentication processing failed' } });
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Completing Login...</h2>
        <p className="text-gray-600 mt-2">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
}

export default AuthSuccess;