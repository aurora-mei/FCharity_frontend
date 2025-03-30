import React, { useState, useEffect } from "react";
import apiService from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const AdminRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await apiService.getAllRequests();
        setRequests(response.data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      }
    };
    fetchRequests();
  }, []);

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

  const filteredRequests = requests
    .filter((req) =>
      req.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((req) =>
      filterStatus === "All" ? true : req.status === filterStatus
    );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusData = [
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

  return (
    <div className="p-5 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
        Manage Requests
      </h1>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by user name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Biểu đồ trạng thái yêu cầu */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Request Status Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
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

      {/* Danh sách yêu cầu */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          All Requests ({filteredRequests.length})
        </h2>
        {filteredRequests.length === 0 ? (
          <p className="text-gray-500 text-center">No requests found.</p>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedRequests.map((req) => (
                <div
                  key={req.request_id}
                  className="p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div className="request-info">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {req.user?.full_name || "Unknown"}
                      </h3>
                      <p className="text-gray-600">
                        Organization:{" "}
                        {req.organization?.organization_name || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        Status:{" "}
                        <span
                          className={`font-semibold ${
                            req.status === "approved"
                              ? "text-green-600"
                              : req.status === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {req.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateRequest(req.request_id, "approved")
                            }
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateRequest(req.request_id, "rejected")
                            }
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminRequestManagement;
