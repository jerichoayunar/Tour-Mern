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
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <TrendingUp className="absolute inset-0 m-auto text-blue-600 w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Loading Dashboard</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
              <div className="text-sm text-gray-500 hidden sm:block">
                Updated {lastUpdate}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
      | 🔹 Top Stats Cards (Revenue, Bookings, Users, Packages)    |
      ------------------------------------------------------------- */}
      <section className="mb-8">
        {dashboardData.stats && <DashboardStats stats={dashboardData.stats} />}
      </section>

      {/* -------------------------------------------------------------
      | 📊 Left: Analytics Charts   |  ⚡ Right: Quick Actions +   |
      |                             |     Notifications / To-Dos  |
      ------------------------------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Analytics Charts - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
                <p className="text-gray-600 text-sm mt-1">Monthly trends and insights</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Revenue</span>
                </div>
              </div>
            </div>
            <DashboardCharts
              monthlyBookings={dashboardData.stats?.monthlyBookings}
              destinationPopularity={dashboardData.stats?.destinationPopularity}
            />
          </div>
        </div>

        {/* Right: Quick Actions & Notifications - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors text-left">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Create Booking</div>
                  <div className="text-xs text-gray-600">Add new reservation</div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-colors text-left">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Generate Report</div>
                  <div className="text-xs text-gray-600">Export analytics</div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-colors text-left">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Manage Packages</div>
                  <div className="text-xs text-gray-600">Update offerings</div>
                </div>
              </button>
            </div>
          </div>

          {/* Notifications / To-Dos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">New Booking</div>
                  <div className="text-xs text-gray-600">Sarah Johnson - Bali Package</div>
                  <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Action Required</div>
                  <div className="text-xs text-gray-600">Review pending bookings</div>
                  <div className="text-xs text-gray-500 mt-1">1 day ago</div>
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
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
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