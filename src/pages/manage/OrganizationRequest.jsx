import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import ManagerLayout from "../../components/Layout/ManagerLayout";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";

const OrganizationRequest = () => {
  const { organizationId } = useParams();
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState([]);

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
      value: requests.filter((r) => r.status === "pending").length,
    },
    {
      name: "Approved",
      value: requests.filter((r) => r.status === "approved").length,
    },
    {
      name: "Rejected",
      value: requests.filter((r) => r.status === "rejected").length,
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
      <div className="pl-2">
        <div className="inline-flex gap-2 items-baseline">
          <FaLink />
          <Link to={"/"} className="hover:underline">
            Home
          </Link>
        </div>
        <span> / </span>
        <Link to={"/manage-organization"} className="hover:underline">
          my-organization
        </Link>
        <span> / </span>
        <Link to={"/manage-organization/requests"} className="hover:underline">
          requests
        </Link>
      </div>
      <div className="min-h-screen bg-gray-100 p-6 m-10">
        <div className="max-w-7xl mx-auto">
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

          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationRequest;
