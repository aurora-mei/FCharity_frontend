import React, { useState } from "react";
import { MdManageAccounts } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { SiPhpmyadmin } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import { useSelector } from "react-redux";

const MemberCard = ({ member, handleDeleteMember, handleChangeMemberRole }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openRoleOptions, setOpenRoleOptions] = useState(false);

  const currentRole = useSelector((state) => state.organization.currentRole);

  return (
    <div className="border border-gray-300 rounded-md flex justify-between items-center p-4 pb-6 relative">
      <div className="flex items-center justify-between gap-2">
        <div className="w-20 h-20 rounded-full overflow-hidden hover:cursor-pointer">
          <img
            src={member.user.avatar || "https://avatar.iran.liara.run/public"}
            alt="member avatar"
            className="w-full h-full object-cover"
            onerror={`this.onerror=null; this.src=${"https://avatar.iran.liara.run/public"};`}
          />
        </div>
        <div className="flex flex-col gap-1 justify-center">
          <p
            className="font-semibold text-lg hover:cursor-pointer hover:underline"
            style={{ margin: 0, padding: 0 }}
          >
            {member.user.fullName}
          </p>
          <p
            className="text-sm hover:cursor-pointer hover:underline"
            style={{ margin: 0, padding: 0 }}
          >
            {member.user.email}
          </p>
        </div>
      </div>
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full hover:bg-gray-300 flex items-center justify-center gap-1 hover:cursor-pointer"
          onClick={() => {
            setOpenMenu((prev) => !prev);
          }}
        >
          <BsThreeDots style={{ fontSize: "24px" }} />
        </div>
        {openMenu && currentRole !== "member" && (
          <div className="absolute top-8 -right-1 flex flex-col w-[120px] py-1 bg-white border border-gray-100 shadow-md z-50 rounded-md">
            <div
              className="hover:cursor-pointer hover:text-green-500 hover:bg-gray-100 px-3 py-1 flex items-center gap-2"
              onClick={() => setOpenRoleOptions((prev) => !prev)}
            >
              <MdOutlinePublishedWithChanges />
              <span>Roles</span>
            </div>
            {openRoleOptions && (
              <div className="hover:cursor-pointer px-2 py-1 flex flex-col gap-1 ml-3 border rounded-sm border-gray-200">
                <div
                  className=" px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex gap-2 items-center"
                  onClick={() => {
                    handleChangeMemberRole(member, "CEO");
                    setOpenRoleOptions(false);
                    setOpenMenu(false);
                  }}
                >
                  <SiPhpmyadmin /> <span className="text-xs">CEO</span>
                </div>
                <div
                  className=" px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full flex gap-2 items-center"
                  onClick={() => {
                    handleChangeMemberRole(member, "MANAGER");
                    setOpenRoleOptions(false);
                    setOpenMenu(false);
                  }}
                >
                  <MdManageAccounts /> <span className="text-xs">Manager</span>
                </div>
                <div
                  className=" px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex gap-2 items-center"
                  onClick={() => {
                    handleChangeMemberRole(member, "MEMBER");
                    setOpenRoleOptions(false);
                    setOpenMenu(false);
                  }}
                >
                  <FaUser /> <span className="text-xs">Member</span>
                </div>
              </div>
            )}

            <div
              className="hover:cursor-pointer hover:text-red-500 hover:bg-gray-100 px-3 py-1 flex items-center gap-2"
              onClick={() => {
                handleDeleteMember(member);
                setOpenMenu(false);
              }}
            >
              <MdDelete /> <span>Delete</span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-2 right-3 flex gap-1 justify-between items-center">
        {member.memberRole === "CEO" && (
          <div className=" px-2 py-1 bg-purple-600 text-white rounded-full flex gap-1 justify-between items-center">
            <SiPhpmyadmin /> <span className="text-xs">CEO</span>
          </div>
        )}
        {member.memberRole === "MANAGER" && (
          <div className=" px-2 py-1 bg-yellow-500 text-white rounded-full flex gap-1 justify-between items-center">
            <MdManageAccounts /> <span className="text-xs">Manager</span>
          </div>
        )}
        {member.memberRole === "MEMBER" && (
          <div className=" px-2 py-1 bg-blue-500 text-white rounded-full flex gap-1 justify-between items-center">
            <FaUser /> <span className="text-xs">Member</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCard;
