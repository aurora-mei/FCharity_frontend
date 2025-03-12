import React, { useState, useEffect } from "react";
import apiService from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiService.getAllReports();
        setReports(response.data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports
    .filter((report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((report) =>
      filterStatus === "All" ? true : report.status === filterStatus
    );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const reportTrendData = reports.reduce((acc, report) => {
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

  return (
    <div className="p-5 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
        Manage Reports
      </h1>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
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
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Biểu đồ báo cáo */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Reports Over Time
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

      {/* Danh sách báo cáo */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          All Reports ({filteredReports.length})
        </h2>
        {filteredReports.length === 0 ? (
          <p className="text-gray-500 text-center">No reports found.</p>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedReports.map((report) => (
                <div
                  key={report.report_id}
                  className="p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="report-info">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {report.title || "Untitled"}
                    </h3>
                    <p className="text-gray-600">
                      Reported By: {report.reporter?.full_name || "Unknown"}
                    </p>
                    <p className="text-gray-600">
                      Date: {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Status:{" "}
                      <span
                        className={`font-semibold ${
                          report.status === "Resolved"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {report.status || "Pending"}
                      </span>
                    </p>
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

export default AdminReportManagement;
