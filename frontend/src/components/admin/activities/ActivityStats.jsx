import React from 'react';

const ActivityStats = ({ activities }) => {
  // Calculate comprehensive statistics
  const calculateStats = () => {
    const today = new Date();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return {
      total: activities.length,
      today: activities.filter(a => {
        const activityDate = new Date(a.createdAt);
        return activityDate.toDateString() === today.toDateString();
      }).length,
      recent: activities.filter(a => new Date(a.createdAt) > twentyFourHoursAgo).length,
      logins: activities.filter(a => a.type === 'login').length,
      security: activities.filter(a => 
        a.type === 'login_failed' || 
        a.type === 'password_changed' ||
        a.type === 'account_suspended'
      ).length,
      registrations: activities.filter(a => a.type === 'user_registered').length,
      failedLogins: activities.filter(a => a.type === 'login_failed').length,
      bookings: activities.filter(a => a.type?.includes('booking')).length,
      payments: activities.filter(a => a.type?.includes('payment')).length,
      uniqueUsers: new Set(activities.map(a => a.userId?._id || a.userId).filter(Boolean)).size
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: 'Total Activities',
      value: stats.total,
      description: 'All time records',
      icon: '📊',
      color: 'blue',
      trend: 'all'
    },
    {
      title: 'Last 24 Hours',
      value: stats.recent,
      description: 'Recent activity',
      icon: '🕒',
      color: 'green',
      trend: 'recent'
    },
    {
      title: 'Today',
      value: stats.today,
      description: "Today's activities",
      icon: '📅',
      color: 'purple',
      trend: 'today'
    },
    {
      title: 'Active Users',
      value: stats.uniqueUsers,
      description: 'Unique users',
      icon: '👥',
      color: 'orange',
      trend: 'users'
    },
    {
      title: 'Logins',
      value: stats.logins,
      description: 'Successful logins',
      icon: '🔐',
      color: 'indigo',
      trend: 'logins'
    },
    {
      title: 'Registrations',
      value: stats.registrations,
      description: 'New user sign-ups',
      icon: '🆕',
      color: 'emerald',
      trend: 'registrations'
    },
    {
      title: 'Failed Logins',
      value: stats.failedLogins,
      description: 'Failed authentication attempts',
      icon: '🚫',
      color: 'red',
      trend: 'failed-logins'
    },
    {
      title: 'Security Events',
      value: stats.security,
      description: 'Security alerts',
      icon: '🛡️',
      color: 'red',
      trend: 'security'
    },
    {
      title: 'Bookings',
      value: stats.bookings,
      description: 'Booking activities',
      icon: '🎫',
      color: 'emerald',
      trend: 'bookings'
    },
    {
      title: 'Payments',
      value: stats.payments,
      description: 'Payment processing',
      icon: '💳',
      color: 'amber',
      trend: 'payments'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600',
      red: 'from-red-500 to-red-600',
      emerald: 'from-emerald-500 to-emerald-600',
      amber: 'from-amber-500 to-amber-600'
    };
    return colorMap[color] || 'from-gray-500 to-gray-600';
  };

  const getBgColor = (color) => {
    const colorMap = {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      purple: 'bg-purple-50',
      orange: 'bg-orange-50',
      indigo: 'bg-indigo-50',
      red: 'bg-red-50',
      emerald: 'bg-emerald-50',
      amber: 'bg-amber-50'
    };
    return colorMap[color] || 'bg-gray-50';
  };

  return (
    <div className="mb-8">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {statCards.map((stat, _index) => (
          <div
            key={stat.title}
            className={`${getBgColor(stat.color)} rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(stat.color)} flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-lg font-semibold text-gray-800">
                {stat.title}
              </p>
              <p className="text-sm text-gray-600">
                {stat.description}
              </p>
            </div>

            {/* Progress bar for visual indication */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(stat.color)} transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${Math.min((stat.value / Math.max(stats.total, 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Trend indicator */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-500">Updated just now</span>
              {stat.value > 0 && (
                <span className="flex items-center text-green-600 font-medium">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Bar */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
          <div>
            <h4 className="font-semibold text-gray-900">System Status: Operational</h4>
            <p className="text-sm text-gray-600 mt-1">
              Monitoring {stats.total} activities across {stats.uniqueUsers} users
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">All Systems Normal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;