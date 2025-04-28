import React, { useState, useEffect } from "react";

import { IoSearch } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteOrganizationMember,
  getAllJoinRequestsByOrganizationId,
  getAllMembersInOrganization,
  updateOrganizationMemberRole,
} from "../../redux/organization/organizationSlice";

import MemberCard from "./components/MemberCard.jsx";
import InvitationModel from "./components/InvitationModel.jsx";
import InvitationsReviewModel from "./components/InvitationsReviewModel.jsx";
import JoinRequestReviewModel from "./components/JoinRequestReviewModel.jsx";
import UserRoleChart from "./components/charts/UserRoleChart.jsx";

const OrganizationMember = () => {
  const dispatch = useDispatch();

  const currentOrganizationMembers = useSelector(
    (state) => state.organization.currentOrganizationMembers
  );
  const ownedOrganization = useSelector(
    (state) => state.organization.ownedOrganization
  );

  const joinRequests = useSelector((state) => state.organization.joinRequests);

  const loading = useSelector((state) => state.organization.loading);
  const error = useSelector((state) => state.organization.error);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModelOpen, setIsModelOpen] = useState({
    open: false,
    content: 0,
  });

  console.log("current organizationMembers", currentOrganizationMembers);

  useEffect(() => {
    if (ownedOrganization?.organizationId) {
      dispatch(getAllMembersInOrganization(ownedOrganization.organizationId));
      dispatch(
        getAllJoinRequestsByOrganizationId(ownedOrganization.organizationId)
      );
    }
  }, [dispatch, ownedOrganization]);

  const handleDeleteMember = async (member) => {
    console.log("member", member);
    try {
      dispatch(deleteOrganizationMember(member.membershipId));
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  const handleChangeMemberRole = (member, role) => {
    try {
      dispatch(updateOrganizationMemberRole({ ...member, memberRole: role }));
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
  };

  return (
    <div className="min-h-[390px]">
      <div className="p-5">
        <p
          className="text-xl font-semibold"
          style={{ margin: 0, padding: 0, marginBottom: "20px" }}
        >
          Organization Members
        </p>
        <div className="flex items-center justify-end gap-6 mb-6">
          <div className="w-[220px] h-[100px] bg-gray-100 shrink-0 rounded-md shadow-md">
            <UserRoleChart
              currentOrganizationMembers={currentOrganizationMembers}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center ml-1">
            <label htmlFor="searchTerm" className="-mr-8 z-10">
              <IoSearch style={{ fontSize: "22px", color: "gray" }} />
            </label>
            <input
              type="text"
              name="searchTerm"
              id="searchTerm"
              placeholder="Search..."
              className="w-full pl-10 p-2 bg-gray-50 border border-gray-300 rounded-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 items-center justify-between">
            <button
              type="button"
              className="text-gray-800 rounded-sm bg-gray-300 px-4 py-2 hover:bg-gray-400 hover:cursor-pointer transition duration-200"
              onClick={() => setIsModelOpen({ open: true, content: 1 })}
            >
              Invite new member
            </button>
            <button
              type="button"
              className="text-gray-800 rounded-sm bg-gray-300 px-4 py-2 hover:bg-gray-400 hover:cursor-pointer transition duration-200"
              onClick={() => {
                setIsModelOpen({ open: true, content: 2 });
              }}
            >
              Invitations have sent
            </button>
            <div className="relative">
              <button
                type="button"
                className="text-gray-800 rounded-sm bg-gray-300 px-4 py-2 hover:bg-gray-400 hover:cursor-pointer transition duration-200"
                onClick={() => {
                  setIsModelOpen({ open: true, content: 3 });
                }}
              >
                Join requests
              </button>
              {joinRequests.length > 0 && (
                <div className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 rounded-full">
                  <span className="text-white text-md">
                    {joinRequests.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 grid md:grid-cols-1 lg:grid-cols-2 gap-2">
          {currentOrganizationMembers &&
            currentOrganizationMembers
              ?.filter((member) => {
                if (
                  searchTerm === "" ||
                  member.user.fullName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  member.user.email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                ) {
                  return true;
                }
                return false;
              })
              .map((member, index) => (
                <MemberCard
                  key={index}
                  member={member}
                  handleDeleteMember={handleDeleteMember}
                  handleChangeMemberRole={handleChangeMemberRole}
                />
              ))}
        </div>
      </div>
      {isModelOpen?.open && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-60 bg-opacity-50 z-40 w-screen h-screen"
            onClick={() => setIsModelOpen({ open: false, content: 0 })}
          />
          <div className="bg-white rounded-lg shadow-lg px-3 py-3 w-[850px] h-[500px] max-w-full max-h-full transform transition-all duration-300 animate-fade-in z-50">
            {isModelOpen?.content === 1 && (
              <InvitationModel setIsModelOpen={setIsModelOpen} />
            )}
            {isModelOpen?.content === 2 && (
              <InvitationsReviewModel setIsModelOpen={setIsModelOpen} />
            )}
            {isModelOpen?.content === 3 && (
              <JoinRequestReviewModel setIsModelOpen={setIsModelOpen} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationMember;
