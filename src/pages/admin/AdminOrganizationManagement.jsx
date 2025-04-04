import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

const AdminOrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [newOrg, setNewOrg] = useState({
    organizationName: "",
    email: "",
    phoneNumber: "",
    address: "",
    organizationDescription: "",
    pictures: "",
    organizationStatus: "Active",
    ceoId: null,
    starttime: "",
    shutdown_day: "",
    wallet_address: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [ceoSearch, setCeoSearch] = useState(""); // Tìm kiếm CEO
  const [showCeoSuggestions, setShowCeoSuggestions] = useState(false); // Hiển thị/ẩn danh sách gợi ý
  const [imagePreview, setImagePreview] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, userRes] = await Promise.all([
          apiService.getAllOrganizations(),
          apiService.getAllUsers(),
        ]);
        setOrganizations(orgRes.data);
        // console.log("Organizations:", orgRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Xử lý khi chọn file qua input hoặc kéo thả
  const handleImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewOrg({ ...newOrg, pictures: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageChange(file);
    } else {
      alert("Please drop an image file!");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.createOrganization(newOrg);
      setOrganizations([...organizations, res.data]);
      setNewOrg({
        organizationName: "",
        email: "",
        phoneNumber: "",
        address: "",
        organizationDescription: "",
        pictures: "",
        organizationStatus: "Active",
        ceoId: null,
        starttime: "",
        shutdown_day: "",
        wallet_address: "",
      });
      setCeoSearch("");
      setImagePreview(null);
      alert("Organization created successfully!");
    } catch (err) {
      console.error("Failed to create organization:", err);
      alert("Failed to create organization");
    }
  };

  const handleDelete = async (organizationId) => {
    if (window.confirm("Do you want to delete this organization?")) {
      try {
        await apiService.deleteOrganization(organizationId);
        setOrganizations(
          organizations.filter((org) => org.organizationId !== organizationId)
        );
        alert("Organization deleted successfully!");
      } catch (err) {
        console.error("Failed to delete organization:", err);
        alert("Failed to delete organization");
      }
    }
  };

  // Lọc danh sách người dùng dựa trên ceoSearch
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(ceoSearch.toLowerCase())
  );

  const filteredOrgs = organizations
    .filter((org) =>
      org.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((org) =>
      filterStatus === "All" ? true : org.organizationStatus === filterStatus
    );

  const totalPages = Math.ceil(filteredOrgs.length / itemsPerPage);
  const paginatedOrgs = filteredOrgs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Xử lý khi nhập vào ceoSearch
  const handleCeoSearchChange = (e) => {
    setCeoSearch(e.target.value);
    setShowCeoSuggestions(true); // Hiển thị danh sách gợi ý khi nhập
  };

  // Xử lý khi chọn một CEO từ danh sách
  const handleCeoSelect = (user) => {
    setNewOrg({ ...newOrg, ceoId: user.userId });
    setCeoSearch(user.fullName); // Hiển thị tên CEO trong input
    setShowCeoSuggestions(false); // Đóng danh sách gợi ý
  };

  return (
    <div className="p-5 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
        Manage Organizations
      </h1>

      {/* Form tạo tổ chức mới */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Create New Organization
        </h2>
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <input
              value={newOrg.organizationName}
              onChange={(e) =>
                setNewOrg({ ...newOrg, organizationName: e.target.value })
              }
              placeholder="Organization Name"
              required
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              value={newOrg.email}
              onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
              placeholder="Email"
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              value={newOrg.phoneNumber}
              onChange={(e) =>
                setNewOrg({ ...newOrg, phoneNumber: e.target.value })
              }
              placeholder="Phone Number"
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              value={newOrg.address}
              onChange={(e) =>
                setNewOrg({ ...newOrg, address: e.target.value })
              }
              placeholder="Address"
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <textarea
              value={newOrg.organizationDescription}
              onChange={(e) =>
                setNewOrg({
                  ...newOrg,
                  organizationDescription: e.target.value,
                })
              }
              placeholder="Description"
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none min-h-[120px] resize-y"
            />
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="p-3 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-40 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p>Drag & drop an image here</p>
                  <p>or</p>
                  <label className="text-blue-500 hover:underline">
                    Click to select
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            <input
              type="date"
              value={newOrg.starttime}
              onChange={(e) =>
                setNewOrg({ ...newOrg, starttime: e.target.value })
              }
              placeholder="Start Date"
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              type="date"
              value={newOrg.shutdown_day}
              onChange={(e) =>
                setNewOrg({ ...newOrg, shutdown_day: e.target.value })
              }
              placeholder="Shutdown Date"
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              value={newOrg.wallet_address}
              onChange={(e) =>
                setNewOrg({ ...newOrg, wallet_address: e.target.value })
              }
              placeholder="Wallet Address"
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <div className="relative">
              <input
                value={ceoSearch}
                onChange={handleCeoSearchChange}
                onFocus={() => setShowCeoSuggestions(true)} // Hiển thị khi focus
                placeholder="Search CEO by name..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              {showCeoSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg z-10">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="p-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCeoSelect(user)}
                      >
                        {user.fullName} ({user.email})
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">No users found</div>
                  )}
                </div>
              )}
            </div>
            <select
              value={newOrg.organizationStatus}
              onChange={(e) =>
                setNewOrg({ ...newOrg, organizationStatus: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
          >
            Create Organization
          </button>
        </form>
      </section>

      {/* Bộ lọc và tìm kiếm */}
      <section className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </section>

      {/* Danh sách tổ chức */}
      <section className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          All Organizations ({filteredOrgs.length})
        </h2>
        {filteredOrgs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No organizations found.
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedOrgs.map((org) => (
                <div
                  key={org.organizationId}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Ảnh bìa */}
                  <div className="relative h-48 w-full">
                    <img
                      src={
                        org.pictures
                          ? `http://localhost:8080${org.pictures}`
                          : "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVhY2V8ZW58MHx8MHx8fDA%3D"
                      }
                      alt={`${org.organizationName} cover`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/600x200?text=No+Image";
                        console.error(
                          `Failed to load image: http://localhost:8080${org.pictures}`
                        );
                      }}
                    />
                    {/* Tên tổ chức trên ảnh bìa */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-xl font-semibold text-white truncate">
                        {org.organizationName}
                      </h3>
                    </div>
                  </div>

                  {/* Nội dung */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm">
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">CEO:</span>{" "}
                          {org.ceo?.fullName || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {org.email || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {org.phoneNumber || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {org.address || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className={`font-semibold ${
                              org.organizationStatus === "Active"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {org.organizationStatus}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Start:</span>{" "}
                          {org.starttime || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Shutdown:</span>{" "}
                          {org.shutdown_day || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Wallet:</span>{" "}
                          {org.wallet_address || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Mô tả */}
                    <p className="mt-4 text-gray-600 text-sm">
                      <span className="font-medium">Description:</span>{" "}
                      {org.organizationDescription
                        ? org.organizationDescription.substring(0, 150) + "..."
                        : "N/A"}
                    </p>

                    {/* Nút hành động */}
                    <div className="flex gap-3 mt-6 justify-end">
                      <Link
                        to={`/admin/organizations/${org.organizationId}/edit`}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(org.organizationId)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                      <Link
                        to={`/organizations/${org.organizationId}`}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 text-sm font-medium"
              >
                Previous
              </button>
              <span className="text-gray-700 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 text-sm font-medium"
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

export default AdminOrganizationManagement;
