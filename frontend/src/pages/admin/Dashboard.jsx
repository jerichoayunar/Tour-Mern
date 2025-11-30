// src/pages/admin/Dashboard.jsx — CLEAN 3-SECTION LAYOUT
import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import DashboardStats from "../../components/admin/dashboard/DashboardStats";
import DashboardCharts from "../../components/admin/dashboard/DashboardCharts";
import { adminService } from "../../services/adminService";
import {
  RefreshCw,
  Shield,
  Calendar,
  TrendingUp,
  Bell,
  Plus,
  FileText,
  Settings
} from "lucide-react";
import BackupButton from '../../components/Backup/BackupButton';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';

// Small admin-only action: show backup button and link to backups page
const AdminBackupAction = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;

  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-yellow-50">
      <div className="flex-1">
        <div className="font-medium text-gray-900">Backups</div>
        <div className="text-xs text-gray-600">Create or manage backups</div>
      </div>
      <div className="flex items-center gap-2">
        <BackupButton />
        <a href="/admin/backups" className="text-sm text-blue-600 underline">Manage</a>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentBookings: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [statsResponse, recentBookingsResponse] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentBookings(),
        ]);

        if (isMounted) {
          const statsResp = statsResponse?.data ?? statsResponse;
          const recentResp = recentBookingsResponse?.data ?? recentBookingsResponse;
          setDashboardData({
            stats: statsResp?.data ?? statsResp ?? null,
            recentBookings: recentResp?.data ?? recentResp ?? null,
          });
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error("Dashboard API error:", error);
        showToast("Error loading dashboard data", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => (isMounted = false);
  }, [showToast]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const [statsResponse, recentBookingsResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentBookings(),
      ]);

      const statsResp = statsResponse?.data ?? statsResponse;
      const recentResp = recentBookingsResponse?.data ?? recentBookingsResponse;
      setDashboardData({
        stats: statsResp?.data ?? statsResp ?? null,
        recentBookings: recentResp?.data ?? recentResp ?? null,
      });
      setLastUpdate(new Date().toLocaleTimeString());
      showToast("Dashboard updated", "success");
    } catch (error) {
      console.error("Dashboard refresh error:", error);
      showToast("Error updating dashboard", "error");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="flex items-center justify-center">
              <Loader size="lg" />
            </div>
            <TrendingUp className="absolute inset-0 m-auto text-blue-600 w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Loading Dashboard</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-platinum p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm">Business performance overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <div className="text-sm text-gray-500 hidden sm:block">Updated {lastUpdate}</div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {refreshing ? <Loader size="sm" /> : <RefreshCw className="w-4 h-4" />}
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <section className="mb-8">{dashboardData.stats && <DashboardStats stats={dashboardData.stats} />}</section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            
            <DashboardCharts monthlyBookings={dashboardData.stats?.monthlyBookings} destinationPopularity={dashboardData.stats?.destinationPopularity} />
          </div>
        </div>

        {/* Right: Quick Actions & Notifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Admin Notifications</div>
                    <div className="text-xs text-gray-600">Quick links for inquiries and bookings</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <a href="/admin/inquiries" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Inquiries</div>
                      <div className="text-xs text-gray-600">View recent inquiries</div>
                    </div>
                    <div className="text-sm text-gray-700">&nbsp;</div>
                  </a>

                  <a href="/admin/bookings" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Bookings</div>
                      <div className="text-xs text-gray-600">Manage reservations</div>
                    </div>
                    <div className="text-sm font-semibold text-blue-600">
                      {dashboardData?.recentBookings?.length ?? dashboardData?.stats?.bookingCount ?? '—'}
                    </div>
                  </a>
                </div>

                <div className="mt-3">
                  <AdminBackupAction />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <div className="font-medium text-gray-900">Bookings</div>
                    <div className="text-xs text-gray-600">New / recent bookings</div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">{dashboardData?.recentBookings?.length ?? dashboardData?.stats?.bookingCount ?? 0}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div>
                    <div className="font-medium text-gray-900">Inquiries</div>
                    <div className="text-xs text-gray-600">New inquiries</div>
                  </div>
                  <div className="text-sm font-semibold text-amber-600">{dashboardData?.stats?.inquiryCount ?? dashboardData?.inquiriesCount ?? 0}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <div className="font-medium text-gray-900">Users</div>
                    <div className="text-xs text-gray-600">New users</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">{dashboardData?.stats?.userCount ?? dashboardData?.userCount ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refreshing Overlay */}
      {refreshing && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center gap-3">
            <Loader size="md" />
            <div>
              <p className="font-medium text-gray-900">Updating Dashboard</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;