import React from "react";
import { Link } from "react-router-dom";
import {
  HomeFilled,
  DashboardFilled,
  ProjectFilled,
  TruckFilled,
  BankFilled,
} from "@ant-design/icons";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaBuilding } from "react-icons/fa";

import { FaBuildingUser } from "react-icons/fa6";

const UserSidebar = () => {
  return (
    <div className="w-64 h-full fixed bg-white shadow-md overflow-y-auto">
      <div className="flex flex-col p-4 space-y-2">
        <Link
          to={`/`}
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
        >
          <HomeFilled style={{ fontSize: "24px" }} />
          <span className="text-base font-medium">Home</span>
        </Link>

        <Link
          to={`/organizations`}
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
        >
          <FaBuilding style={{ fontSize: "24px" }} />
          <span className="text-base font-medium">Organizations</span>
        </Link>
        <Link
          to={`/rankings/organizations`}
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
        >
          <FaArrowTrendUp style={{ fontSize: "24px" }} />
          <span className="text-base font-medium">Rankings</span>
        </Link>
        <Link
          to="/projects"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
        >
          <ProjectFilled style={{ fontSize: "24px" }} />
          <span className="text-base font-medium">Projects</span>
        </Link>
        <Link
          to="/requests"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
        >
          <TruckFilled style={{ fontSize: "24px" }} />
          <span className="text-base font-medium">Requests</span>
        </Link>
      </div>
    </div>
  );
};

export default UserSidebar;
