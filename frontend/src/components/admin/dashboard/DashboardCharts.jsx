// src/components/admin/dashboard/DashboardCharts.jsx - POLISHED & CLEAN
import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";
import { Calendar, TrendingUp, Users, BarChart3, MapPin } from "lucide-react";

const DashboardCharts = ({ monthlyBookings, _destinationPopularity }) => {
  const [activeChart, setActiveChart] = useState('bookings');
  
  const hasMonthlyData = monthlyBookings?.length > 0;

  // Create complete 12-month data
  const completeYearData = useMemo(() => {
    if (!hasMonthlyData) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return monthNames.map((monthName, index) => {
      const monthData = monthlyBookings.find(item => item.month === monthName);
      
      return {
        month: monthName,
        bookings: Number(monthData?.bookings) || 0,
        revenue: Number(monthData?.revenue) || 0
      };
    });
  }, [monthlyBookings, hasMonthlyData]);

  // Check for any booking activity
  const hasAnyBookings = completeYearData.some(month => month.bookings > 0);
  const activeMonths = completeYearData.filter(month => month.bookings > 0).length;

  // Calculate metrics
  const metrics = {
    totalBookings: completeYearData.reduce((sum, month) => sum + month.bookings, 0),
    totalRevenue: completeYearData.reduce((sum, month) => sum + month.revenue, 0),
    averageMonthly: (completeYearData.reduce((sum, month) => sum + month.bookings, 0) / 12).toFixed(1),
    peakMonth: completeYearData.reduce((max, month) => month.bookings > max.bookings ? month : max, completeYearData[0]),
    activeMonths: activeMonths
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.dataKey === 'bookings' ? '📅 Bookings' : '💰 Revenue'}: {' '}
              {entry.dataKey === 'revenue' ? `₱${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (!hasMonthlyData || !hasAnyBookings) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Data Available</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your analytics dashboard will display beautiful charts and insights once you start receiving bookings.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <Users className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-blue-800 text-sm font-medium">
            <strong>💡 Getting Started:</strong> Create test bookings to unlock powerful analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Annual Performance</h3>
              <p className="text-gray-300 text-sm mt-1">
                January-December Overview • {metrics.activeMonths} Active Months
              </p>
            </div>
          </div>
          <div className="flex space-x-2 mt-4 lg:mt-0">
            <button
              onClick={() => setActiveChart('bookings')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeChart === 'bookings' 
                  ? 'bg-white text-gray-900 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📅 Bookings
            </button>
            <button
              onClick={() => setActiveChart('revenue')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeChart === 'revenue' 
                  ? 'bg-white text-gray-900 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              💰 Revenue
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{metrics.totalBookings}</div>
            <div className="text-sm text-purple-700 font-medium">Total Bookings</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">₱{metrics.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-blue-700 font-medium">Total Revenue</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="text-2xl font-bold text-green-600">{metrics.averageMonthly}</div>
            <div className="text-sm text-green-700 font-medium">Avg/Month</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{metrics.activeMonths}/12</div>
            <div className="text-sm text-orange-700 font-medium">Active Months</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completeYearData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={activeChart} 
                fill={activeChart === 'bookings' ? '#8b5cf6' : '#3b82f6'} 
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            📊 Showing data for {metrics.activeMonths} active months
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Bookings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Revenue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;