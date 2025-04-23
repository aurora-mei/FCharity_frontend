import React, { useState } from "react";
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
import { PiArticleMediumFill } from "react-icons/pi";
import { SiPhpmyadmin } from "react-icons/si";
import { VscOrganization } from "react-icons/vsc";
import { SiAwsorganizations } from "react-icons/si";

const ManagerSidebar = () => {
  const [mode, setMode] = useState("joined"); // owned, managed, joined

  return (
    <div className="w-64 h-full fixed flex bg-white shadow-md overflow-y-auto">
      <div className="pt-4 px-1  flex flex-col gap-2 bg-gray-50">
        <div
          className="flex justify-center items-center p-2 hover:cursor-pointer hover:bg-gray-300"
          title="My owned organization"
          onClick={() => {
            setMode("owned");
          }}
        >
          <SiPhpmyadmin style={{ fontSize: "24px" }} />
        </div>
        <div
          className="flex justify-center items-center p-2 hover:cursor-pointer hover:bg-gray-300"
          title="My managed organizations"
          onClick={() => {
            setMode("joined");
          }}
        >
          <SiAwsorganizations style={{ fontSize: "24px" }} />
        </div>
        <div
          className="flex justify-center items-center p-2 hover:cursor-pointer hover:bg-gray-300"
          title="My joined organizations"
          onClick={() => {
            setMode("joined");
          }}
        >
          <VscOrganization style={{ fontSize: "24px" }} />
        </div>
      </div>
      <div className="flex flex-col p-4 space-y-2">
        {mode === "owned" && (
          <Link
            to={`/my-organization`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
          >
            <HomeFilled style={{ fontSize: "24px" }} />
            <span className="text-base font-medium">My Organization</span>
          </Link>
        )}

        {mode === "joined" && (
          <Link
            to={`/managed-organizations`}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
          >
            <HomeFilled style={{ fontSize: "24px" }} />
            <span className="text-base font-medium">Joined Organizations</span>
          </Link>
        )}

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
        <Link
          to="/my-organization/articles"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200"
        >
          <PiArticleMediumFill style={{ fontSize: "24px" }} />
          <span className="text-base font-medium">Articles</span>
        </Link>
      </div>
    </div>
  );
};

export default ManagerSidebar;
