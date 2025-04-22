import React from "react";
import { Link, useNavigate } from "react-router-dom";

const OrganizationCard = ({ org, handleJoinOrganization }) => {
  return (
    <div key={org.id} className="px-2 ">
      <div className="relative flex flex-col rounded-lg overflow-hidden shadow-md border border-gray-300 h-[300px] w-[250px] md:w-[250px] lg:w-[300px] ">
        {/* Hình ảnh nền và tiêu đề */}
        <div className="relative h-32 shrink-0">
          <img
            src={org.backgroundUrl}
            alt={org.organizationName}
            className="w-full h-full object-cover opacity-90"
            loading="lazy" // Lazy loading
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-white text-lg font-bold">
              {org.organizationDescription || "No description"}
            </h3>
          </div>
        </div>
        {/* Thông tin tổ chức */}
        <div className="grow-1 flex flex-col justify-between ">
          <div className="p-4 pb-0">
            <div className="flex items-center gap-2 mb-2">
              <Link
                className="text-gray-800 font-semibold hover:cursor-pointer"
                style={{ padding: 0, margin: 0 }}
                to={`/organizations/${org.organizationId}`}
              >
                <span className="hover:underline">{org.organizationName}</span>
              </Link>
              {org.organizationStatus !== "PENDING" && (
                <span className="text-blue-500">
                  <svg
                    viewBox="0 0 12 13"
                    width={20}
                    height={20}
                    fill="currentColor"
                    title="The account was verified."
                    className=""
                  >
                    <title>This account was verified.</title>
                    <g fillRule="evenodd" transform="translate(-98 -917)">
                      <path d="m106.853 922.354-3.5 3.5a.499.499 0 0 1-.706 0l-1.5-1.5a.5.5 0 1 1 .706-.708l1.147 1.147 3.147-3.147a.5.5 0 1 1 .706.708m3.078 2.295-.589-1.149.588-1.15a.633.633 0 0 0-.219-.82l-1.085-.7-.065-1.287a.627.627 0 0 0-.6-.603l-1.29-.066-.703-1.087a.636.636 0 0 0-.82-.217l-1.148.588-1.15-.588a.631.631 0 0 0-.82.22l-.701 1.085-1.289.065a.626.626 0 0 0-.6.6l-.066 1.29-1.088.702a.634.634 0 0 0-.216.82l.588 1.149-.588 1.15a.632.632 0 0 0 .219.819l1.085.701.065 1.286c.014.33.274.59.6.604l1.29.065.703 1.088c.177.27.53.362.82.216l1.148-.588 1.15.589a.629.629 0 0 0 .82-.22l.701-1.085 1.286-.064a.627.627 0 0 0 .604-.601l.065-1.29 1.088-.703a.633.633 0 0 0 .216-.819"></path>
                    </g>
                  </svg>
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              <div>{org.totalMembers} thành viên</div>
              <div>
                {org.totalCompletedProjects} / {org.totalProjects} completed
                projects
              </div>
            </p>
          </div>
          {/* Nút Tham gia nhóm */}
          <div
            onClick={() => {
              handleJoinOrganization(org.organizationId);
            }}
            disabled={org.joined}
            className={`flex mx-4 mb-4 items-center justify-center py-2 rounded-lg transition font-semibold text-sm ${
              org.joined
                ? "bg-gray-300 text-black cursor-not-allowed"
                : "bg-blue-100 text-blue-600 hover:bg-gray-200 hover:cursor-pointer"
            }`}
          >
            {org.joined ? "Pending" : "Join Organization"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
