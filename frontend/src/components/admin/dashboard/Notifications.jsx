// src/components/admin/dashboard/Notifications.jsx
import React from "react";
import { Bell, Calendar, AlertCircle, CheckCircle } from "lucide-react";

const Notifications = () => {
  const notifications = [
    {
      type: "booking",
      title: "New Booking Received",
      description: "Sarah Johnson - Premium Bali Package",
      time: "2 hours ago",
      icon: Calendar,
      color: "blue",
      unread: true,
    },
    {
      type: "alert",
      title: "Action Required",
      description: "3 pending bookings need review",
      time: "1 day ago",
      icon: AlertCircle,
      color: "amber",
      unread: true,
    },
    {
      type: "success",
      title: "Payment Processed",
      description: "Payment confirmed for Michael Chen",
      time: "3 days ago",
      icon: CheckCircle,
      color: "green",
      unread: false,
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    amber: "bg-amber-50 border-amber-200",
    green: "bg-green-50 border-green-200",
  };

  const iconColors = {
    blue: "text-blue-600",
    amber: "text-amber-600",
    green: "text-green-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-amber-50 rounded-lg">
          <Bell className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <p className="text-gray-600 text-sm">Recent activities & alerts</p>
        </div>
        <div className="ml-auto bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
          {notifications.filter(n => n.unread).length} new
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => {
          const IconComponent = notification.icon;
          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors duration-200 ${colorClasses[notification.color]} ${notification.unread ? 'ring-1 ring-opacity-20' : ''}`}
            >
              <div className={`p-1.5 rounded-lg bg-white border border-gray-100 ${iconColors[notification.color]}`}>
                <IconComponent className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-gray-900 text-sm">
                    {notification.title}
                    {notification.unread && (
                      <span className="ml-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{notification.description}</div>
                <div className="text-xs text-gray-500 mt-2">{notification.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
        View All Notifications
      </button>
    </div>
  );
};

export default Notifications;