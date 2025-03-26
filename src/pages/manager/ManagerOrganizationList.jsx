import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { setSelectedOrganization } from "../../redux/organization/organizationSlice";

const ManagerOrganizationList = ({ managedOrganizations }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedOrganization } = useSelector((state) => state.organization);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  console.log(managedOrganizations);

  // Lọc tổ chức theo tên và trạng thái
  const filteredOrgs = managedOrganizations
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

  // Xử lý khi chọn một tổ chức
  const handleSelectOrganization = (org) => {
    dispatch(setSelectedOrganization(org));
    navigate("/manager/organizations/");
  };

  return (
    <Layout>
      <div className="p-5 max-w-7xl mx-auto font-sans">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Your Managed Organizations
        </h1>

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
            Managed Organizations ({filteredOrgs.length})
          </h2>
          {filteredOrgs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No organizations found.
            </p>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {paginatedOrgs.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => handleSelectOrganization(org)}
                    className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                      selectedOrganization?.organizationId ===
                      org.organizationId
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    {/* Ảnh bìa */}
                    <div className="relative h-48 w-full">
                      <img
                        src={
                          org.pictures
                            ? `http://localhost:8080${org.pictures}`
                            : "https://media.istockphoto.com/id/1317323736/photo/a-view-up-into-the-trees-direction-sky.jpg?s=612x612&w=0&k=20&c=i4HYO7xhao7CkGy7Zc_8XSNX_iqG0vAwNsrH1ERmw2Q="
                        }
                        alt={`${org.organizationName} cover`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://media.istockphoto.com/id/1317323736/photo/a-view-up-into-the-trees-direction-sky.jpg?s=612x612&w=0&k=20&c=i4HYO7xhao7CkGy7Zc_8XSNX_iqG0vAwNsrH1ERmw2Q=";
                        }}
                      />
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
                        </div>
                      </div>

                      {/* Mô tả */}
                      <p className="mt-4 text-gray-600 text-sm">
                        <span className="font-medium">Description:</span>{" "}
                        {org.organizationDescription
                          ? org.organizationDescription.substring(0, 100) +
                            "..."
                          : "N/A"}
                      </p>

                      {/* Nút hành động */}
                      <div className="flex gap-3 mt-6 justify-end">
                        <Link
                          to={`/manager/organizations/${org.organizationId}`}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 text-sm font-medium"
                        >
                          Manage
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

        {/* Hiển thị tổ chức đang được chọn (nếu có) */}
        {selectedOrganization && (
          <section className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Selected Organization
            </h2>
            <p className="text-gray-700">
              <span className="font-medium">Name:</span>{" "}
              {selectedOrganization.organizationName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Status:</span>{" "}
              {selectedOrganization.organizationStatus}
            </p>
            <button
              onClick={() => dispatch(setSelectedOrganization(null))}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-sm font-medium"
            >
              Deselect
            </button>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ManagerOrganizationList;
