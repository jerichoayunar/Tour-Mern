import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";

import ToastContainer from "./components/Common/ToastContainer.jsx";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";
import ScrollToTop from "./components/Common/ScrollToTop.jsx";
import ScrollToTopHandler from "./components/layout/ScrollToTopHandler.jsx";

// Layouts
import UserLayout from "./components/layout/user/UserLayout.jsx";
import AdminLayout from "./components/layout/admin/AdminLayout.jsx";

// User Pages
import Home from "./pages/user/Home.jsx";
import Packages from "./pages/user/Packages.jsx";
import Destinations from "./pages/user/Destinations.jsx";
import Bookings from "./pages/user/Bookings.jsx";
import Inquiry from "./pages/user/Inquiry.jsx";
import MyInquiries from "./pages/user/MyInquiries.jsx";
import About from "./pages/user/About.jsx";
import Profile from "./pages/user/Profile.jsx";
import Login from "./pages/user/Login.jsx";
import Register from "./pages/user/Register.jsx";
import ForgotPassword from "./pages/user/ForgotPassword.jsx";
import ResetPassword from "./pages/user/ResetPassword.jsx";
import AuthSuccess from "./pages/user/AuthSuccess.jsx";

// Admin Pages (Lazy Loaded)
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const ManagePackages = lazy(() => import("./pages/admin/ManagePackages.jsx"));
const ManageBookings = lazy(() => import("./pages/admin/ManageBookings.jsx"));
const ManageDestinations = lazy(() => import("./pages/admin/ManageDestinations.jsx"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers.jsx"));
const ManageActivities = lazy(() => import("./pages/admin/ManageActivities.jsx"));
const ManageInquiries = lazy(() => import("./pages/admin/ManageInquiries.jsx"));
const Settings = lazy(() => import("./pages/admin/Settings.jsx"));
const BackupsPage = lazy(() => import("./pages/admin/Backups.jsx"));

// Protected Route
import ProtectedRoute from "./components/Common/ProtectedRoute.jsx"; 

function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <AuthProvider>
          <BookingProvider>
            <Router>
              <ToastContainer />
              <ScrollToTopHandler />
              <ScrollToTop />

              <Routes>
            {/* ================= USER FRONTEND ================= */}
            <Route path="/*" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="packages" element={<Packages />} />
              <Route path="destinations" element={<Destinations />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="inquiry" element={<Inquiry />} />
              <Route path="my-inquiries" element={
                <ProtectedRoute>
                  <MyInquiries />
                </ProtectedRoute>
              } />
              <Route path="about" element={<About />} />
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
              <Route index element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              } /> 
              <Route path="dashboard" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="packages" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManagePackages />
                </Suspense>
              } /> 
              <Route path="bookings" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManageBookings />
                </Suspense>
              } />
              <Route path="destinations" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManageDestinations />
                </Suspense>
              } />
              <Route path="clients" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManageUsers />
                </Suspense>
              } /> 
              <Route path="activities" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManageActivities />
                </Suspense>
              } />
              <Route path="inquiries" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManageInquiries />
                </Suspense>
              } />
              
              <Route path="settings" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              } />
              <Route path="backups" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <BackupsPage />
                </Suspense>
              } />
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<h2 className="text-center mt-20">404 | Page Not Found</h2>} />
          </Routes>
            </Router>
          </BookingProvider>
        </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}

export default App;