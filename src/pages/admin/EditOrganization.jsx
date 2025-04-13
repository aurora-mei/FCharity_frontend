import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../services/api";

const EditOrganization = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organizationId: organizationId,
    organizationName: "",
    email: "",
    phoneNumber: "",
    address: "",
    organizationDescription: "",
    pictures: "",
    ceoId: null,
  });
  const [users, setUsers] = useState([]); // Danh sách người dùng để chọn CEO
  const [ceoSearch, setCeoSearch] = useState(""); // Tìm kiếm CEO
  const [showCeoSuggestions, setShowCeoSuggestions] = useState(false); // Hiển thị/ẩn gợi ý CEO
  const [imagePreview, setImagePreview] = useState(null); // Preview ảnh
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [error, setError] = useState(null); // Thông báo lỗi

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgRes, userRes] = await Promise.all([
          apiService.getOrganization(organizationId),
          apiService.getAllUsers(),
        ]);
        const orgData = orgRes.data;
        setFormData(orgData);
        setUsers(userRes.data);
        setCeoSearch(orgData.ceo?.fullName || ""); // Hiển thị tên CEO hiện tại
        setImagePreview(
          orgData.pictures
            ? `https://fcharity.azurewebsites.net${orgData.pictures}`
            : "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVhY2V8ZW58MHx8MHx8fDA%3D"
        ); // Hiển thị ảnh hiện tại
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load organization data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [organizationId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý chọn ảnh
  const handleImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, pictures: reader.result }); // Lưu base64
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

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, pictures: "" });
  };

  // Lọc danh sách người dùng
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(ceoSearch.toLowerCase())
  );

  const handleCeoSearchChange = (e) => {
    setCeoSearch(e.target.value);
    setShowCeoSuggestions(true);
  };

  const handleCeoSelect = (user) => {
    setFormData({ ...formData, ceoId: user.userId });
    setCeoSearch(user.fullName);
    setShowCeoSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiService.updateOrganization(formData);
      alert("Organization updated successfully!");
      navigate("/admin/organizations");
    } catch (err) {
      console.error("Failed to update organization:", err);
      setError(err.response?.data?.message || "Failed to update organization.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Edit Organization
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Cột trái */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="Organization Name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="organizationDescription"
              value={formData.organizationDescription}
              onChange={handleChange}
              placeholder="Description"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 min-h-[120px] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Background Image
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="p-4 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-40 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition duration-200"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Drag & drop an image here</p>
                  <p>or</p>
                  <label className="text-blue-500 hover:underline cursor-pointer">
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
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              CEO
            </label>
            <input
              value={ceoSearch}
              onChange={handleCeoSearchChange}
              onFocus={() => setShowCeoSuggestions(true)}
              placeholder="Search CEO by name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            {showCeoSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg z-10">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="p-3 hover:bg-gray-100 cursor-pointer text-gray-700"
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
        </div>

        {/* Nút hành động */}
        <div className="md:col-span-2 flex justify-center gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/organizations")}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOrganization;
