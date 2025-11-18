import React from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const AnalyticsCharts = ({ data, timeRange }) => {
  const { bookingTrends, topPerformers, revenueBreakdown } = data;

  console.log('📊 CHART DATA RECEIVED:', {
    bookingTrends,
    topPerformers, 
    revenueBreakdown
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Check if we have real data from backend
  const hasRealBookingData = bookingTrends?.periods?.length > 0;
  const hasRealDestinationData = topPerformers?.topDestinations?.length > 0;
  const hasRealRevenueData = revenueBreakdown?.byPackageType?.length > 0;

  // Transform backend data for charts or use fallback
  const lineChartData = hasRealBookingData 
    ? bookingTrends.periods.map((period, index) => ({
        period,
        bookings: bookingTrends.bookings[index] || 0,
        revenue: bookingTrends.revenue[index] || 0
      }))
    : [
        { period: 'Jan', bookings: 12, revenue: 5000 },
        { period: 'Feb', bookings: 19, revenue: 8000 },
        { period: 'Mar', bookings: 8, revenue: 3500 },
        { period: 'Apr', bookings: 15, revenue: 6200 }
      ];

  const barChartData = hasRealRevenueData
    ? revenueBreakdown.byPackageType
    : [
        { category: 'Luxury', amount: 25000 },
        { category: 'Standard', amount: 18000 },
        { category: 'Budget', amount: 12000 }
      ];

  const pieChartData = hasRealDestinationData
    ? topPerformers.topDestinations
    : [
        { name: 'Bali', bookings: 15 },
        { name: 'Paris', bookings: 12 },
        { name: 'Tokyo', bookings: 8 },
        { name: 'New York', bookings: 6 }
      ];

  const donutChartData = hasRealRevenueData && revenueBreakdown.byDestination
    ? revenueBreakdown.byDestination
    : [
        { destination: 'Bali', revenue: 15000 },
        { destination: 'Paris', revenue: 12000 },
        { destination: 'Tokyo', revenue: 8000 }
      ];

  return (
    <div className="space-y-8">
      {/* 1. LINE CHART - Booking Trends */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white/10 rounded-xl">📈</div>
            <div>
              <h3 className="text-xl font-bold">Booking Trends & Revenue</h3>
              <p className="text-gray-300 text-sm mt-1">
                {timeRange === 'week' ? '7-Day' : timeRange === 'month' ? '30-Day' : timeRange === 'quarter' ? '90-Day' : '12-Month'} Overview
                {!hasRealBookingData && ' • Using Sample Data'}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* FIX: Remove ResponsiveContainer, use fixed dimensions */}
          <LineChart width={800} height={400} data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </div>
      </div>

      {/* 2. BAR CHART - Revenue by Package Type */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">💰</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Revenue by Package Type</h3>
            {!hasRealRevenueData && (
              <p className="text-sm text-gray-500">Using sample data</p>
            )}
          </div>
        </div>
        {/* FIX: Remove ResponsiveContainer, use fixed dimensions */}
        <BarChart width={800} height={400} data={barChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip />
          <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </div>

      {/* 3. PIE CHART - Destination Distribution */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">🌍</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Top Destinations</h3>
            {!hasRealDestinationData && (
              <p className="text-sm text-gray-500">Using sample data</p>
            )}
          </div>
        </div>
        {/* FIX: Remove ResponsiveContainer, use fixed dimensions */}
        <PieChart width={400} height={400}>
          <Pie
            data={pieChartData}
            dataKey="bookings"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      {/* 4. DONUT CHART - Package Types Revenue */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">📦</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Revenue by Destination</h3>
            {!hasRealRevenueData && (
              <p className="text-sm text-gray-500">Using sample data</p>
            )}
          </div>
        </div>
        {/* FIX: Remove ResponsiveContainer, use fixed dimensions */}
        <PieChart width={400} height={400}>
          <Pie
            data={donutChartData}
            dataKey="revenue"
            nameKey="destination"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            label
          >
            {donutChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
};

export default AnalyticsCharts;