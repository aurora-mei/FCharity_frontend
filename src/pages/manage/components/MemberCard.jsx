import React from "react";
import { MdManageAccounts } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { SiPhpmyadmin } from "react-icons/si";

const MemberCard = ({ member }) => {
  return (
    <div className="border border-gray-300 rounded-md flex justify-between items-center p-4 pb-6 relative">
      <div className="flex items-center justify-between gap-2">
        <div className="w-20 h-20 rounded-xl overflow-hidden hover:cursor-pointer">
          <img
            src={"https://avatar.iran.liara.run/public"}
            alt=""
            className="w-full h-full object-cover"
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
      <div className="w-10 h-10 rounded-full hover:bg-gray-300 flex items-center justify-center gap-1 hover:cursor-pointer">
        <span className="w-[5px] h-[5px] rounded-full bg-gray-500 shrink-0"></span>
        <span className="w-[5px] h-[5px] rounded-full bg-gray-500 shrink-0"></span>
        <span className="w-[5px] h-[5px] rounded-full bg-gray-500 shrink-0"></span>
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
