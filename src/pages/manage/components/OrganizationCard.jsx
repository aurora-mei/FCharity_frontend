import React from "react";
import { useNavigate } from "react-router-dom";

const OrganizationCard = ({ org, handleCloseCard, handleJoinGroup }) => {
  const navigate = useNavigate();

  const handleMoveToOrg = (orgId) => {
    navigate(`/organizations/${orgId}`);
  };

  return (
    <div
      key={org.id}
      className="px-2 hover:cursor-pointer"
      onClick={() => handleMoveToOrg(org.id)}
    >
      <div className="relative rounded-lg overflow-hidden shadow-md border border-gray-300 w-[250px] md:w-[250px] lg:w-[300px]">
        {/* Hình ảnh nền và tiêu đề */}
        <div className="relative h-32">
          <img
            src={org.image}
            alt={org.title}
            className="w-full h-full object-cover opacity-70"
            loading="lazy" // Lazy loading
            onError={(e) => ""} // Fallback image
          />
          <div className="absolute inset-0 bg-gray-300 bg-opacity-40 flex items-center justify-center">
            <h3 className="text-white text-lg font-bold">{org.title}</h3>
          </div>
        </div>
        {/* Thông tin tổ chức */}
        <div className="p-4">
          <div className="flex items-center mb-2">
            <h4 className="text-gray-800 font-semibold">{org.name}</h4>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-500 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">
            {org.members} thành viên • {org.postsPerDay} / {org.postsPerDay}{" "}
            completed projects
          </p>
          {/* Nút Tham gia nhóm */}
          <button
            onClick={() => handleJoinGroup(org.id)}
            disabled={org.joined}
            className={`mt-3 w-full py-2 rounded-lg transition ${
              org.joined
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {org.joined ? "Joined" : "Join Organization"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
