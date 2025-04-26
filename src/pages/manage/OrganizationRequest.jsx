import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import apiService from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useSelector } from "react-redux";
import { Empty } from "antd";

const OrganizationRequest = () => {
  const { organizationId } = useParams();
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState([]);

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await apiService.getAllRequests(organizationId);
        setRequests(response.data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      }
    };
    fetchRequests();
  }, [organizationId]);

  const handleUpdateRequest = async (requestId, status) => {
    try {
      await apiService.updateJoinRequest(requestId, status);
      setRequests(
        requests.map((req) =>
          req.request_id === requestId ? { ...req, status } : req
        )
      );
      alert(`Request ${status} successfully!`);
    } catch (err) {
      console.error("Failed to update request:", err);
      alert("Failed to update request");
    }
  };

  const filteredRequests = requests.filter((req) => req.status === activeTab);

  const requestStatusData = [
    {
      name: "Pending",
      value: requests.filter((r) => r.status === "pending")?.length || 0,
    },
    {
      name: "Approved",
      value: requests.filter((r) => r.status === "approved")?.length || 0,
    },
    {
      name: "Rejected",
      value: requests.filter((r) => r.status === "rejected")?.length || 0,
    },
  ];
  const COLORS = ["#f1c40f", "#2ecc71", "#e74c3c"];

  const tabs = [
    { id: "pending", label: "Pending Requests" },
    { id: "approved", label: "Approved Requests" },
    { id: "rejected", label: "Rejected Requests" },
  ];

  const renderContent = () => {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            Request Status Overview
          </h3>
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
        <h3 className="text-xl font-medium text-gray-700 mb-4">
          {tabs.find((t) => t.id === activeTab).label}
        </h3>
        {filteredRequests.length === 0 ? (
          <p className="text-gray-600">No requests found.</p>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.request_id}
                className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {req.user?.full_name || "Unknown"}
                  </p>
                  <p className="text-gray-600">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        req.status === "pending"
                          ? "text-yellow-500"
                          : req.status === "approved"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {req.status}
                    </span>
                  </p>
                </div>
                {activeTab === "pending" && (
                  <div className="space-x-2">
                    <button
                      onClick={() =>
                        handleUpdateRequest(req.request_id, "approved")
                      }
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateRequest(req.request_id, "rejected")
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {currentOrganization && (
        <div className="min-h-screen mx-auto bg-gray-50 p-4">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Request Management
          </h1>

          <nav className="flex space-x-4 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="bg-white rounded-sm shadow-md px-6 py-3 h-[600px] overflow-y-scroll">
            {renderContent()}
          </div>
        </div>
      )}
      {!currentOrganization && (
        <div className="p-6">
          <div className="flex justify-end items-center">
            <Link
              to="/organizations"
              className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
            >
              Discover organizations
            </Link>
          </div>
          <div className="flex justify-center items-center min-h-[500px]">
            <Empty description="You are not a manager of any organization" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationRequest;
