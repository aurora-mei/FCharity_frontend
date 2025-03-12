import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import Layout from "../../components/Layout/Layout";

const ManagerOrganizationDashboard = () => {
  const { organizationId } = useParams();
  const [data, setData] = useState({
    members: [],
    joinRequests: [],
    inviteRequests: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, joinReqRes, inviteReqRes] = await Promise.all([
          apiService.getOrganizationMembers(organizationId),
          apiService.getJoinRequestsByOrganizationId(organizationId),
          apiService.getInviteRequests(organizationId),
        ]);
        setData({
          members: membersRes.data,
          joinRequests: joinReqRes.data,
          inviteRequests: inviteReqRes.data,
        });
      } catch (err) {
        console.error("Failed to fetch organization data:", err);
      }
    };
    fetchData();
  }, [organizationId]);

  // Dữ liệu cho biểu đồ trạng thái yêu cầu tham gia
  // const joinRequestStatusData = [
  //   {
  //     name: "Pending",
  //     value: data.joinRequests.filter((r) => r.status === "pending").length,
  //   },
  //   {
  //     name: "Approved",
  //     value: data.joinRequests.filter((r) => r.status === "approved").length,
  //   },
  //   {
  //     name: "Rejected",
  //     value: data.joinRequests.filter((r) => r.status === "rejected").length,
  //   },
  // ];

  const joinRequestStatusData = [
    { name: "Pending", value: 3 },
    { name: "Approved", value: 5 },
    { name: "Rejected", value: 2 },
  ];

  // Dữ liệu cho biểu đồ trạng thái lời mời tham gia
  // const inviteRequestStatusData = [
  //   {
  //     name: "Pending",
  //     value: data.inviteRequests.filter((r) => r.status === "pending").length,
  //   },
  //   {
  //     name: "Accepted",
  //     value: data.inviteRequests.filter((r) => r.status === "accepted").length,
  //   },
  //   {
  //     name: "Declined",
  //     value: data.inviteRequests.filter((r) => r.status === "declined").length,
  //   },
  // ];

  const inviteRequestStatusData = [
    { name: "Pending", value: 4 },
    { name: "Accepted", value: 3 },
    { name: "Declined", value: 2 },
  ];

  // Dữ liệu cho biểu đồ số lượng thành viên theo thời gian
  const memberTrendData = data.members.reduce((acc, member) => {
    const date = new Date(member.joinDate).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // const memberChartData = Object.entries(memberTrendData).map(
  //   ([date, count]) => ({
  //     date,
  //     count,
  //   })
  // );

  const memberChartData = [
    { date: "01/01/2023", count: 1 },
    { date: "01/15/2023", count: 2 },
    { date: "02/01/2023", count: 1 },
    { date: "02/15/2023", count: 3 },
    { date: "03/01/2023", count: 2 },
    { date: "03/15/2023", count: 4 },
    { date: "04/01/2023", count: 3 },
  ];

  // Màu sắc cho biểu đồ
  const COLORS = ["#f1c40f", "#2ecc71", "#e74c3c", "#3498db"];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Tiêu đề */}
          <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
            Organization Dashboard
          </h1>

          {/* Tổng quan số liệu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Total Members
              </h3>
              <p className="text-3xl font-semibold text-gray-800">
                {data.members.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Join Requests
              </h3>
              <p className="text-3xl font-semibold text-gray-800">
                {data.joinRequests.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Invite Requests
              </h3>
              <p className="text-3xl font-semibold text-gray-800">
                {data.inviteRequests.length}
              </p>
            </div>
          </div>

          {/* Biểu đồ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Biểu đồ trạng thái yêu cầu tham gia */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-gray-700 text-center mb-4">
                Join Requests Status
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={joinRequestStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {joinRequestStatusData.map((entry, index) => (
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

            {/* Biểu đồ trạng thái lời mời tham gia */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-gray-700 text-center mb-4">
                Invite Requests Status
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inviteRequestStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {inviteRequestStatusData.map((entry, index) => (
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

            {/* Biểu đồ xu hướng thành viên */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-gray-700 text-center mb-4">
                Members Over Time
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={memberChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3498db" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Biểu đồ số lượng yêu cầu theo trạng thái */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-gray-700 text-center mb-4">
                Requests Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: "Join Requests",
                      Pending: joinRequestStatusData[0].value,
                      Approved: joinRequestStatusData[1].value,
                      Rejected: joinRequestStatusData[2].value,
                    },
                    {
                      name: "Invite Requests",
                      Pending: inviteRequestStatusData[0].value,
                      Accepted: inviteRequestStatusData[1].value,
                      Declined: inviteRequestStatusData[2].value,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Pending" stackId="a" fill="#f1c40f" />
                  <Bar dataKey="Approved" stackId="a" fill="#2ecc71" />
                  <Bar dataKey="Rejected" stackId="a" fill="#e74c3c" />
                  <Bar dataKey="Accepted" stackId="a" fill="#2ecc71" />
                  <Bar dataKey="Declined" stackId="a" fill="#e74c3c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerOrganizationDashboard;
