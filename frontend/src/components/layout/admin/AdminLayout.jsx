// src/components/layout/admin/AdminLayout.jsx - CORRECTED
import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // ✅ Add this import
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`admin-layout ${sidebarCollapsed ? "collapsed" : ""}`}>
      <AdminSidebar collapsed={sidebarCollapsed} />
      <div className="admin-main">
        <AdminHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="admin-content">
          <Outlet /> {/* ✅ Use Outlet for nested routes */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;