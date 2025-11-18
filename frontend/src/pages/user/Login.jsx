// ✅ src/pages/user/Login.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "../../components/Auth/LoginForm";
import "./AuthPages.css";

function Login() {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkedAuth, setCheckedAuth] = useState(false);

  // ✅ Handle redirect after login
  useEffect(() => {
    if (!loading && checkedAuth && isAuthenticated && user) {
      console.log("✅ AUTH CONFIRMED - User:", user);

      // Default redirect path
      let redirectPath = "/";

      // 1️⃣ If we have stored redirect path (from ProtectedRoute)
      const storedRedirect = localStorage.getItem("redirectAfterLogin");
      if (storedRedirect) {
        redirectPath = storedRedirect;
        localStorage.removeItem("redirectAfterLogin");
      }
      // 2️⃣ If route state has "from"
      else if (location.state?.from?.pathname) {
        redirectPath = location.state.from.pathname;
      }
      // 3️⃣ Role-based fallback
      else if (user.role === "admin") {
        redirectPath = "/admin/dashboard";
      } else {
        redirectPath = "/profile";
      }

      console.log("🔄 Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }

    if (!loading) {
      setCheckedAuth(true);
    }
  }, [isAuthenticated, loading, navigate, checkedAuth, user, location]);

  // ✅ Show loading UI
  if (loading || !checkedAuth) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div>Checking authentication...</div>
        </div>
      </div>
    );
  }

  // ✅ Show redirect message when already logged in
  if (isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div>Redirecting...</div>
        </div>
      </div>
    );
  }

  // ✅ Default: show login form
  return (
    <div className="auth-page">
      <div className="auth-container">
        <LoginForm onSwitchToRegister={() => navigate("/register")} />
      </div>
    </div>
  );
}

export default Login;
