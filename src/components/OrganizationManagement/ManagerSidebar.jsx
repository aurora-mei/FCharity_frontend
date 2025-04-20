import React from "react";
import { Link } from "react-router-dom";
import {
  HomeFilled,
  DashboardFilled,
  ProjectFilled,
  TruckFilled,
  BankFilled,
} from "@ant-design/icons";
import { FaBuildingUser } from "react-icons/fa6";
import { RiCalendarScheduleFill } from "react-icons/ri";

const ManagerSidebar = () => {
  return (
    <div className="flex">
      <div></div>
      <div className="w-64 h-full fixed bg-white shadow-md overflow-y-auto">
        <div className="flex flex-col p-4 space-y-2">
          <Link
            to={`/my-organization`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
          >
            <HomeFilled style={{ fontSize: "24px" }} />
            <span className="text-base font-medium">My Organization</span>
          </Link>

          <Link
            to={`/my-organization/dashboard`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
          >
            <DashboardFilled style={{ fontSize: "24px" }} />
            <span className="text-base font-medium">Dashboard</span>
          </Link>

          <Link
            to={`/my-organization/members`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
          >
            <FaBuildingUser style={{ fontSize: "24px" }} />
            <span className="text-base font-medium">Members</span>
          </Link>
          <Link
            to="/my-organization/projects"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
          >
            <ProjectFilled style={{ fontSize: "24px" }} />
            <span className="text-base font-medium">Projects</span>
          </Link>
          <Link
            to="/my-organization/requests"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
          >
            <TruckFilled style={{ fontSize: "24px" }} />
            <span className="text-base font-medium">Requests</span>
          </Link>
          <Link
            to="/my-organization/schedule"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
          >
            <RiCalendarScheduleFill style={{ fontSize: "24px" }} />
            <span className="text-base font-medium">Schedule</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerSidebar;
