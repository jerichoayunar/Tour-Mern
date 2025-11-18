import React from "react";
import DashboardStats from "../../components/admin/dashboard/DashboardStats";
import DashboardCharts from "../../components/admin/dashboard/DashboardCharts";
import RecentBookingsTable from "../../components/admin/dashboard/RecentBookingsTable";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-8">
      <DashboardStats />
      <DashboardCharts />
      <RecentBookingsTable />
    </div>
  );
};

export default Dashboard;
