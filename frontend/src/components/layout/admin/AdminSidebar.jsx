// src/components/layout/admin/AdminSidebar.jsx - UPDATED
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  MapPin,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Activity, // ✅ ADD THIS IMPORT
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const menuItems = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
  { label: "Bookings", icon: <ClipboardList size={20} />, path: "/admin/bookings" }, 
  { label: "Packages", icon: <Package size={20} />, path: "/admin/packages" }, 
  { label: "Destinations", icon: <MapPin size={20} />, path: "/admin/destinations" }, 
  { label: "Clients", icon: <Users size={20} />, path: "/admin/clients" }, 
  { label: "Activity Monitor", icon: <Activity size={20} />, path: "/admin/activities" },
  { label: "Inquiries", icon: <MessageSquare size={20} />, path: "/admin/inquiries" },
  { label: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
];

const AdminSidebar = ({ collapsed }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        <span className="logo-icon">🌍</span>
        {!collapsed && <span className="logo-text">Tour Admin</span>}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.label}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="menu-item logout" onClick={handleLogout}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;