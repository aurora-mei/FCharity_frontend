import React, { useState, useEffect } from "react";
import apiService from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const AdminOrganizationDashboard = () => {
  const [stats, setStats] = useState({
    organizations: [],
    users: [],
    requests: [],
    reports: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgs, users, requests, reports] = await Promise.all([
          apiService.getAllOrganizations(),
          apiService.getAllUsers(),
          apiService.getAllRequests(),
          apiService.getAllReports(),
        ]);
        // console.log("Dashboard Data:", orgs.data);
        setStats({
          organizations: orgs.data,
          users: users.data,
          requests: requests.data,
          reports: reports.data,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  const orgStatusData = [
    {
      name: "Active",
      value: stats.organizations.filter(
        (org) => org.organizationStatus === "Active"
      ).length,
    },
    {
      name: "Inactive",
      value: stats.organizations.filter(
        (org) => org.organizationStatus !== "Active"
      ).length,
    },
  ];

  const userRoleData = [
    {
      name: "Admin",
      value: stats.users.filter((u) => u.userRole === "Admin").length,
    },
    {
      name: "Manager",
      value: stats.users.filter((u) => u.userRole === "Manager").length,
    },
    {
      name: "Member",
      value: stats.users.filter((u) => u.userRole === "Member").length,
    },
  ];

  const requestStatusData = [
    {
      name: "Pending",
      value: stats.requests.filter((r) => r.status === "pending").length,
    },
    {
      name: "Approved",
      value: stats.requests.filter((r) => r.status === "approved").length,
    },
    {
      name: "Rejected",
      value: stats.requests.filter((r) => r.status === "rejected").length,
    },
  ];

  const reportTrendData = stats.reports.reduce((acc, report) => {
    const date = new Date(report.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const reportChartData = Object.entries(reportTrendData).map(
    ([date, count]) => ({
      date,
      count,
    })
  );

  const COLORS = ["#2ecc71", "#e74c3c", "#3498db", "#f1c40f"];

  return (
    <div className="p-5 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Organizations
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.organizations.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">Users</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.users.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">Requests</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.requests.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">Reports</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.reports.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Organization Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orgStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                dataKey="value"
              >
                {orgStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            User Roles
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userRoleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Request Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={requestStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                dataKey="value"
              >
                {requestStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Reports Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#e74c3c" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOrganizationDashboard;
