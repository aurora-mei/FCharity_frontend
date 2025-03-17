import React, { useEffect } from "react";
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

import {
  getOrganizationMembers,
  getOrganizationJoinRequests,
  getOrganizationInviteRequests,
} from "../../redux/organization/organizationSlice";
import { useDispatch, useSelector } from "react-redux";

const ManagerOrganizationDashboard = () => {
  const { selectedOrganization } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrganizationMembers(selectedOrganization?.organizationId));
    // dispatch(getOrganizationJoinRequests(selectedOrganization?.organizationId));
    // dispatch(
    //   getOrganizationInviteRequests(selectedOrganization?.organizationId)
    // );
  }, [selectedOrganization, dispatch]);

  const { members, joinRequests, inviteRequests } = useSelector(
    (state) => state.organizations
  );

  console.log("Members:", members);

  const joinRequestStatusData = [
    {
      name: "Pending",
      value: joinRequests.filter((r) => r.status === "pending").length || 2,
    },
    {
      name: "Approved",
      value: joinRequests.filter((r) => r.status === "approved").length || 3,
    },
    {
      name: "Rejected",
      value: joinRequests.filter((r) => r.status === "rejected").length || 5,
    },
  ];

  const inviteRequestStatusData = [
    {
      name: "Pending",
      value: inviteRequests.filter((r) => r.status === "pending").length || 21,
    },
    {
      name: "Accepted",
      value: inviteRequests.filter((r) => r.status === "accepted").length || 10,
    },
    {
      name: "Declined",
      value: inviteRequests.filter((r) => r.status === "declined").length || 5,
    },
  ];

  // Dữ liệu cho biểu đồ số lượng thành viên theo thời gian
  const memberTrendData = members.reduce((acc, member) => {
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

  const COLORS = ["#f1c40f", "#2ecc71", "#e74c3c", "#3498db"];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
            Organization Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Total Members
              </h3>
              <p className="text-3xl font-semibold text-gray-800">
                {members.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Join Requests
              </h3>
              <p className="text-3xl font-semibold text-gray-800">
                {joinRequests.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Invite Requests
              </h3>
              <p className="text-3xl font-semibold text-gray-800">
                {inviteRequests.length}
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
