import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

import ToastContainer from "./components/common/ToastContainer.jsx"; // 🧩 lowercase 'common' for consistency

// Layouts
import UserLayout from "./components/layout/user/UserLayout.jsx";
import AdminLayout from "./components/layout/admin/AdminLayout.jsx";

// User Pages
import Home from "./pages/user/Home.jsx";
import Packages from "./pages/user/Packages.jsx";
import Destinations from "./pages/user/Destinations.jsx";
import Bookings from "./pages/user/Bookings.jsx";
import Inquiry from "./pages/user/Inquiry.jsx";
import Profile from "./pages/user/Profile.jsx";
import Login from "./pages/user/Login.jsx";
import Register from "./pages/user/Register.jsx";
import ForgotPassword from "./pages/user/ForgotPassword.jsx";
import ResetPassword from "./pages/user/ResetPassword.jsx";
import AuthSuccess from "./pages/user/AuthSuccess.jsx";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard.jsx";
import ManagePackages from "./pages/admin/ManagePackages.jsx";
import ManageBookings from "./pages/admin/ManageBookings.jsx";
import ManageDestinations from "./pages/admin/ManageDestinations.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageActivities from "./pages/admin/ManageActivities.jsx";
import ManageInquiries from "./pages/admin/ManageInquiries.jsx";
import Analytics from "./pages/admin/Analytics.jsx";

// Protected Route
import ProtectedRoute from "./components/common/ProtectedRoute.jsx"; 

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <ToastContainer />

          <Routes>
            {/* ================= USER FRONTEND ================= */}
            <Route path="/*" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="packages" element={<Packages />} />
              <Route path="destinations" element={<Destinations />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="inquiry" element={<Inquiry />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="auth/success" element={<AuthSuccess />} />

              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ================= ADMIN FRONTEND ================= */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} /> 
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="packages" element={<ManagePackages />} /> 
              <Route path="bookings" element={<ManageBookings />} />
              <Route path="destinations" element={<ManageDestinations />} />
              <Route path="clients" element={<ManageUsers />} /> 
              <Route path="activities" element={<ManageActivities />} />
              <Route path="inquiries" element={<ManageInquiries />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<h2 className="text-center mt-20">404 | Page Not Found</h2>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;