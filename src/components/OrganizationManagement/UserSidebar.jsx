import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const UserSidebar = () => {
  const [selectedTab, setSelectedTab] = useState("my-organization");
  //my-organization | members | projects | schedule
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/my-organization`);
  }, []);

  return (
    <div className="flex flex-col p-4 space-y-2">
      <Link
        to={`/my-organization`}
        className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200 ${
          selectedTab === "my-organization" ? "bg-gray-100 text-gray-900" : ""
        }`}
      >
        <HomeFilled style={{ fontSize: "24px" }} />
        <span className="text-base font-medium">Organization</span>
      </Link>

      <Link
        to={`/my-organization/members`}
        className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200 ${
          selectedTab === "members" ? "bg-gray-100 text-gray-900" : ""
        }`}
        onClick={() => setSelectedTab("members")}
      >
        <FaBuildingUser style={{ fontSize: "24px" }} />
        <span className="text-base font-medium">Members</span>
      </Link>
      <Link
        to="/my-organization/projects"
        className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200 ${
          selectedTab === "projects" ? "bg-gray-100 text-gray-900" : ""
        }`}
        onClick={() => setSelectedTab("projects")}
      >
        <ProjectFilled style={{ fontSize: "24px" }} />
        <span className="text-base font-medium">Projects</span>
      </Link>

      <Link
        to="/my-organization/schedule"
        className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition duration-200 ${
          selectedTab === "schedule" ? "bg-gray-100 text-gray-900" : ""
        }`}
        onClick={() => setSelectedTab("schedule")}
      >
        <RiCalendarScheduleFill style={{ fontSize: "24px" }} />
        <span className="text-base font-medium">Schedule</span>
      </Link>
    </div>
  );
};

export default UserSidebar;
