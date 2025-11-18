// pages/Register.jsx
import { useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/Auth/RegisterForm';
import './AuthPages.css';

function Register() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // Don't show register form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* ✅ PASS THE onSwitchToLogin PROP */}
        <RegisterForm onSwitchToLogin={() => navigate('/login')} />
      </div>
    </div>
  );
}

export default Register;