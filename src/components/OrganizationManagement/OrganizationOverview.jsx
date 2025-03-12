import React, { useState } from "react";
import api from "../../services/api.js";

const OrganizationOverview = ({ organization }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...organization });
  const [previewImage, setPreviewImage] = useState(
    organization.pictures ||
      "https://www.ri.org//content/uploads/2019/08/timeline-relief-international-general-logo.jpg"
  ); // Ảnh preview
  const [isDragging, setIsDragging] = useState(false); // Trạng thái kéo thả

  // Xử lý thay đổi input text
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý khi kéo file vào
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Xử lý khi thả file
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData({ ...formData, pictures: file }); // Lưu file vào formData để upload
    } else {
      alert("Please drop an image file!");
    }
  };

  // Xử lý khi chọn file từ input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData({ ...formData, pictures: file });
    } else {
      alert("Please select an image file!");
    }
  };

  // Xóa ảnh
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData({ ...formData, pictures: null });
  };

  // Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = new FormData();
      Object.keys(formData).forEach((key) => {
        submissionData.append(key, formData[key]);
      });

      await api.put(
        `/organizations/${organization.organizationId}`,
        submissionData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setEditMode(false);
      alert("Organization updated successfully!");
    } catch (err) {
      console.error("Failed to update organization:", err);
      alert("Failed to update organization");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Overview</h2>
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Các trường input */}
          <div className="space-y-4">
            <input
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="Organization Name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="organizationDescription"
              value={formData.organizationDescription}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Khu vực kéo thả ảnh */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full max-w-md h-auto mx-auto rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500">Drag and drop an image here, or</p>
                <label className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition duration-300">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Nút Save và Cancel */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setPreviewImage(organization.pictures || null); // Reset ảnh về ban đầu
                setFormData({ ...organization }); // Reset form về ban đầu
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Hiển thị ảnh làm background hoặc hình minh họa */}
          {organization.pictures && (
            <div
              className="w-full h-64 bg-cover bg-center rounded-lg shadow-md mb-6"
              style={{
                backgroundImage: `url('http://localhost:8080${organization.pictures}')`,
              }}
            />
          )}
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong className="text-gray-800">Name:</strong>{" "}
              {organization.organizationName}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Description:</strong>{" "}
              {organization.organizationDescription}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Email:</strong>{" "}
              {organization.email}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Phone:</strong>{" "}
              {organization.phoneNumber}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Address:</strong>{" "}
              {organization.address}
            </p>
          </div>
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default OrganizationOverview;
