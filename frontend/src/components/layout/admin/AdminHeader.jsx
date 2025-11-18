// src/components/admin/layout/AdminHeader.jsx
import React, { useState, useEffect } from "react";
import { Menu, CalendarDays } from "lucide-react";
// import "./AdminLayout.css";

const AdminHeader = ({ onToggleSidebar }) => {
  const [currentDateRange, setCurrentDateRange] = useState("");
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const updateDateRange = () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      const startDate = new Date(today);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      const formattedRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;
      setCurrentDateRange(formattedRange);
    };

    updateDateRange();
    
    const now = new Date();
    const timeUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const timeoutId = setTimeout(() => {
      updateDateRange();
      setInterval(updateDateRange, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="menu-btn" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>

        <div className="date-range">
          <CalendarDays size={18} />
          <span>{currentDateRange}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="profile">
          {!logoError ? (
            <img
              src="/images/destinations/bukidnonupdates.jpg"
              alt="Tour Logo"
              className="admin-logo"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="logo-fallback">
              <span>TL</span>
            </div>
          )}
          <div className="profile-info">
            <span className="name">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;