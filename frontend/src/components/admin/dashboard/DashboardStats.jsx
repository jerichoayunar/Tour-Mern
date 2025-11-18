// src/components/admin/dashboard/DashboardStats.jsx - POLISHED & CLEAN
import React from "react";
import { 
  Calendar, 
  Users, 
  Wallet, 
  Package, 
  TrendingUp
} from "lucide-react";

const DashboardStats = ({ stats }) => {
  // Use REAL stats data only
  const displayStats = {
    totalUsers: Number(stats?.totalUsers) || 0,
    totalBookings: Number(stats?.totalBookings) || 0,
    totalPackages: Number(stats?.totalPackages) || 0,
    totalRevenue: Number(stats?.totalRevenue) || 0
  };

  const statsConfig = [
    {
      id: 1,
      title: "Total Bookings",
      value: displayStats.totalBookings.toLocaleString(),
      icon: <Calendar className="w-6 h-6" />,
      description: "All bookings",
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      textColor: "text-purple-600"
    },
    {
      id: 2,
      title: "Registered Users",
      value: displayStats.totalUsers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      description: "Total user accounts", 
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      textColor: "text-blue-600"
    },
    {
      id: 3,
      title: "Total Revenue",
      value: `₱${displayStats.totalRevenue.toLocaleString('en-PH')}`,
      icon: <Wallet className="w-6 h-6" />,
      description: "All-time earnings",
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      textColor: "text-green-600"
    },
    {
      id: 4,
      title: "Active Packages", 
      value: displayStats.totalPackages.toLocaleString(),
      icon: <Package className="w-6 h-6" />,
      description: "Available tour packages",
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      textColor: "text-orange-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {statsConfig.map((item) => (
        <div
          key={item.id}
          className="group bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-xl ${item.bgColor} ${item.borderColor} border shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                <div className={item.textColor}>{item.icon}</div>
              </div>
              
              <div className="text-sm text-gray-400">
                Live
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 leading-tight">
                {item.value}
              </p>
              <p className="text-sm text-gray-400 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                {item.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;