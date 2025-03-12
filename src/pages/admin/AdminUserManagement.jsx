import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiService.getAllUsers();
        setUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiService.deleteUser(userId);
        setUsers(users.filter((user) => user.userId !== userId));
        alert("User deleted successfully!");
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user");
      }
    }
  };

  const filteredUsers = users
    .filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((user) =>
      filterRole === "All" ? true : user.userRole === filterRole
    );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const roleData = [
    {
      name: "Admin",
      value: users.filter((u) => u.userRole === "Admin").length,
    },
    {
      name: "Manager",
      value: users.filter((u) => u.userRole === "Manager").length,
    },
    {
      name: "Member",
      value: users.filter((u) => u.userRole === "Member").length,
    },
  ];
  const COLORS = ["#3498db", "#2ecc71", "#f1c40f"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl font-sans">
      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
        Manage Users
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 md:max-w-md px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Member">Member</option>
        </select>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-medium text-gray-700 text-center mb-4">
          User Role Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              dataKey="value"
            >
              {roleData.map((entry, index) => (
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

      <section className="space-y-6">
        <h2 className="text-xl font-medium text-gray-700">
          All Users ({filteredUsers.length})
        </h2>
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No users found.</p>
        ) : (
          <>
            <div className="grid gap-6">
              {paginatedUsers.map((user) => (
                <div
                  key={user.userId}
                  className="bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row justify-between items-center hover:-translate-y-1 transition-transform duration-200"
                >
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.fullName || "Unknown"}
                    </h3>
                    <p className="text-gray-600">Email: {user.email}</p>
                    <p className="text-gray-600">
                      Role:{" "}
                      <span
                        className={`font-semibold ${
                          user.userRole === "Admin"
                            ? "text-blue-500"
                            : user.userRole === "Manager"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {user.userRole || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <Link
                      to={`/admin/users/${user.userId}/edit`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user.userId)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-blue-500 hover:text-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-blue-500 hover:text-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
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

export default AdminUserManagement;
