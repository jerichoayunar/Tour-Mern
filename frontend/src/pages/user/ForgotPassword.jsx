// pages/ForgotPassword.jsx - CLEAN VERSION
import ForgotPasswordForm from '../../components/Auth/ForgotPasswordForm';

import './AuthPages.css';

function ForgotPassword() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;