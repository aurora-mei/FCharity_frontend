import React from "react";
import {
  FaUser,
  FaPhone,
  FaHome,
  FaCalendar,
  FaIdCard,
  FaWallet,
  FaUsers,
  FaProjectDiagram,
  FaDonate,
  FaStar,
} from "react-icons/fa";

import { MdAttachEmail } from "react-icons/md";

const UserInfoCard = ({
  selectedUser,
  handleInvitation,
  handleDeleteInvitation,
}) => {
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Not Specified";
  };
  return (
    <div className="relative">
      <h2 className="ml-3 text-2xl font-bold text-gray-700 mb-4">
        Candidate information
      </h2>
      <div className="w-[520px] h-[390px] overflow-y-scroll mx-3 p-5 pb-18">
        {selectedUser ? (
          <div className="space-y-6">
            {/* Phần thông tin chính */}
            <div className="flex items-start gap-4">
              <img
                src={
                  selectedUser.avatar || "https://avatar.iran.liara.run/public"
                }
                alt="Avatar"
                className="w-20 h-20 rounded-xl object-cover border-2 border-blue-500 transform transition-transform duration-300 hover:scale-110"
              />
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedUser.fullName}
                </h3>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaIdCard className="text-gray-500" />
                  <span className="font-semibold">ID:</span> {selectedUser?.id}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <MdAttachEmail className="text-gray-500" />
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedUser.email}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaPhone className="text-gray-500" />
                  <span className="font-semibold">Phone number:</span>{" "}
                  {selectedUser.phoneNumber || "Not Specified"}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaHome className="text-gray-500" />
                  <span className="font-semibold">Address:</span>{" "}
                  {selectedUser.address || "Not Specified"}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaIdCard className="text-gray-500" />
                  <span className="font-semibold">Role:</span>{" "}
                  {selectedUser.userRole}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaCalendar className="text-gray-500" />
                  <span className="font-semibold">Ngày tạo:</span>{" "}
                  {formatDate(selectedUser.createdDate)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4" />

            {/* Phần thống kê */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-100 rounded-lg shadow-sm transform transition-transform duration-300 hover:scale-105">
                <FaUsers className="text-blue-600 text-2xl" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Organizations
                  </p>
                  <p className="text-lg font-bold text-blue-600">0</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-100 rounded-lg shadow-sm transform transition-transform duration-300 hover:scale-105">
                <FaProjectDiagram className="text-blue-600 text-2xl" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Projects
                  </p>
                  <p className="text-lg font-bold text-blue-600">0</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg shadow-sm transform transition-transform duration-300 hover:scale-105">
                <FaDonate className="text-orange-600 text-2xl" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">Donated</p>
                  <p className="text-lg font-bold text-orange-600">0 VNĐ</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-100 rounded-lg shadow-sm transform transition-transform duration-300 hover:scale-105">
                <FaStar className="text-red-600 text-2xl" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">Rating</p>
                  <p className="text-lg font-bold text-red-600">0/5</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <FaUser className="text-5xl mb-2" />
            <p className="text-lg">Chưa chọn ứng viên</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-2 right-10">
        <button
          onClick={() => {
            selectedUser?.invited
              ? handleDeleteInvitation(selectedUser)
              : handleInvitation(selectedUser);
          }}
          className={`px-4 py-2 rounded-lg font-semibold transform transition-all duration-300 hover:cursor-pointer hover:scale-105 ${
            selectedUser?.invited
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          style={{ color: "white" }}
        >
          {selectedUser?.invited ? "Hủy mời" : "Mời tham gia"}
        </button>
      </div>
    </div>
  );
};

export default UserInfoCard;
