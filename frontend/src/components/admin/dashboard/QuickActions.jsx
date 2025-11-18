// src/components/admin/dashboard/QuickActions.jsx
import React from "react";
import { 
  Plus, 
  FileText, 
  Settings, 
  Users, 
  Calendar,
  Download,
  BarChart3
} from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: Plus,
      title: "Create Booking",
      description: "Add new reservation",
      color: "blue",
      onClick: () => console.log("Create booking clicked"),
    },
    {
      icon: FileText,
      title: "Generate Report",
      description: "Export analytics data",
      color: "green",
      onClick: () => console.log("Generate report clicked"),
    },
    {
      icon: Settings,
      title: "Manage Packages",
      description: "Update travel packages",
      color: "purple",
      onClick: () => console.log("Manage packages clicked"),
    },
    {
      icon: Users,
      title: "Manage Users",
      description: "View all customers",
      color: "orange",
      onClick: () => console.log("Manage users clicked"),
    },
    {
      icon: Calendar,
      title: "View Calendar",
      description: "Check availability",
      color: "pink",
      onClick: () => console.log("View calendar clicked"),
    },
    {
      icon: Download,
      title: "Export Data",
      description: "Download all data",
      color: "indigo",
      onClick: () => console.log("Export data clicked"),
    },
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200",
    green: "bg-green-100 text-green-600 hover:bg-green-50 hover:border-green-200",
    purple: "bg-purple-100 text-purple-600 hover:bg-purple-50 hover:border-purple-200",
    orange: "bg-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-200",
    pink: "bg-pink-100 text-pink-600 hover:bg-pink-50 hover:border-pink-200",
    indigo: "bg-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <BarChart3 className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-gray-600 text-sm">Frequently used tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 transition-all duration-200 text-left group ${colorClasses[action.color]}`}
            >
              <div className={`p-2 rounded-lg bg-white border border-gray-100 group-hover:scale-110 transition-transform duration-200`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{action.title}</div>
                <div className="text-xs text-gray-600 truncate">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;