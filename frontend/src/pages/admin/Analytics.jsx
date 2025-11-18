// src/pages/admin/Analytics.jsx - UPDATED WITH ANALYTICS INTEGRATION
import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import AnalyticsCharts from '../../components/admin/analytics/AnalyticsCharts';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import Loader from '../../components/ui/Loader';
import '../../components/admin/analytics/Analytics.css';

const Analytics = () => {
  const { data, loading, error, fetchAnalyticsData, updateFilters } = useAnalytics();
  const [timeRange, setTimeRange] = useState('month');

  const timeRanges = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last Year' }
  ];

  // Fetch analytics data when time range changes
  useEffect(() => {
    fetchAnalyticsData({ period: timeRange });
  }, [timeRange, fetchAnalyticsData]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    updateFilters({ period: newRange });
  };

  const handleRetry = () => {
    fetchAnalyticsData({ period: timeRange });
  };

  // Format growth display
  const formatGrowth = (growth) => {
    if (growth === undefined || growth === null) return null;
    const isPositive = growth >= 0;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive,
      trend: isPositive ? 'up' : 'down'
    };
  };

  // Loading state
  if (loading && !data.metrics) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <div className="time-filter">
            <select 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              disabled
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="analytics-loading">
          <Loader />
          <p className="loading-text">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data.metrics) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <div className="time-filter">
            <select 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value)}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { metrics, userStats } = data;

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-filter">
          <select 
            value={timeRange} 
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="metrics-grid">
          <AdminStatsCard
            title="Total Bookings"
            value={metrics.totalBookings?.toLocaleString() || '0'}
            change={formatGrowth(metrics.bookingGrowth)?.value}
            trend={formatGrowth(metrics.bookingGrowth)?.trend}
            icon="📊"
            color="blue"
          />
          <AdminStatsCard
            title="Total Revenue"
            value={`₱${metrics.totalRevenue?.toLocaleString() || '0'}`}
            change={formatGrowth(metrics.revenueGrowth)?.value}
            trend={formatGrowth(metrics.revenueGrowth)?.trend}
            icon="💰"
            color="green"
          />
          <AdminStatsCard
            title="New Users"
            value={metrics.newUsers?.toLocaleString() || '0'}
            change={formatGrowth(userStats?.userGrowth)?.value}
            trend={formatGrowth(userStats?.userGrowth)?.trend}
            icon="👥"
            color="purple"
          />
          <AdminStatsCard
            title="Conversion Rate"
            value={`${metrics.conversionRate?.toFixed(1) || '0'}%`}
            icon="📈"
            color="yellow"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        {data.bookingTrends ? (
          <AnalyticsCharts data={data} timeRange={timeRange} />
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>No chart data available for the selected period</p>
            <button onClick={handleRetry} className="retry-btn">
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      {(metrics || userStats) && (
        <div className="additional-stats">
          <div className="stat-card">
            <h3>Active Destinations</h3>
            <p className="stat-value">{metrics?.activeDestinations || '0'}</p>
          </div>
          <div className="stat-card">
            <h3>Total Packages</h3>
            <p className="stat-value">{metrics?.totalPackages || '0'}</p>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{userStats?.totalUsers?.toLocaleString() || '0'}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p className="stat-value">{userStats?.activeUsers?.toLocaleString() || '0'}</p>
          </div>
        </div>
      )}

      {/* Loading overlay for refreshes */}
      {loading && data.metrics && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Updating data...</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;