import React, { useState, useEffect } from "react";

import ManagerLayout from "../../components/Layout/ManagerLayout";
import { IoSearch } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsersNotInOrganization,
  getAllMembersInOrganization,
  getAllInvitationRequestsByOrganizationId,
  getAllJoinRequestsByOrganizationId,
} from "../../redux/organization/organizationSlice";

import MemberCard from "./components/MemberCard.jsx";
import ReferenceLink from "./components/ReferenceLink.jsx";
import InvitationModel from "./components/InvitationModel.jsx";
import InvitationsReviewModel from "./components/InvitationsReviewModel.jsx";
import JoinRequestReviewModel from "./components/JoinRequestReviewModel.jsx";

const OrganizationMember = () => {
  const dispatch = useDispatch();
  const {
    loading,
    error,
    ownedOrganization,
    currentOrganizationMembers,
    usersOutsideOrganization,
    invitations,
    joinRequests,
  } = useSelector((state) => state.organization);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModelOpen, setIsModelOpen] = useState({
    open: false,
    content: 0,
  });

  const [suggestedUsers, setSuggestedUsers] = useState([]);

  console.log("organizationMembers", currentOrganizationMembers);
  console.log("suggested users: ", suggestedUsers);
  console.log("invitations: ", invitations);

  useEffect(() => {
    if (ownedOrganization?.organizationId) {
      dispatch(getAllMembersInOrganization(ownedOrganization.organizationId));
      dispatch(getAllUsersNotInOrganization(ownedOrganization.organizationId));
      dispatch(
        getAllInvitationRequestsByOrganizationId(
          ownedOrganization.organizationId
        )
      );
      dispatch(
        getAllInvitationRequestsByOrganizationId(
          ownedOrganization.organizationId
        )
      );
      dispatch(
        getAllJoinRequestsByOrganizationId(ownedOrganization.organizationId)
      );
    }
  }, [dispatch, ownedOrganization]);

  useEffect(() => {
    if (usersOutsideOrganization && usersOutsideOrganization.length > 0) {
      setSuggestedUsers(
        usersOutsideOrganization?.map((user) => ({ ...user, invited: false }))
      );
    }
  }, [usersOutsideOrganization]);

  return (
    <div className="min-h-[600px]">
      <ReferenceLink
        link={[
          { name: "Home", path: "/" },
          { name: "my-organization", path: "/my-organization" },
          { name: "members", path: "/my-organization/members" },
        ]}
      />
      <div className="m-10 rounded-xl shadow-md">
        <div className="flex items-center justify-between p-5">
          <p
            className="text-xl font-semibold"
            style={{ margin: 0, padding: 0 }}
          >
            Members
          </p>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center justify-center">
              <label htmlFor="searchTerm" className="-mr-8 z-10">
                <IoSearch style={{ fontSize: "22px", color: "gray" }} />
              </label>
              <input
                type="text"
                name="searchTerm"
                id="searchTerm"
                placeholder="Search..."
                className="w-full pl-10 p-2 bg-gray-50 border border-gray-300 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="text-gray-800 rounded-xl bg-gray-300 px-4 py-2 hover:bg-gray-400 hover:cursor-pointer transition duration-200"
              onClick={() => setIsModelOpen({ open: true, content: 1 })}
            >
              Invite new member
            </button>
            <button
              type="button"
              className="text-gray-800 rounded-xl bg-gray-300 px-4 py-2 hover:bg-gray-400 hover:cursor-pointer transition duration-200"
              onClick={() => {
                dispatch(
                  getAllInvitationRequestsByOrganizationId(
                    ownedOrganization.organizationId
                  )
                );
                setIsModelOpen({ open: true, content: 2 });
              }}
            >
              Invitations have sent
            </button>
            <button
              type="button"
              className="text-gray-800 rounded-xl bg-gray-300 px-4 py-2 hover:bg-gray-400 hover:cursor-pointer transition duration-200"
              onClick={() => {
                dispatch(
                  getAllJoinRequestsByOrganizationId(
                    ownedOrganization.organizationId
                  )
                );
                setIsModelOpen({ open: true, content: 3 });
              }}
            >
              Join requests
            </button>
          </div>
        </div>
        <div className="p-5 grid md:grid-cols-1 lg:grid-cols-2 gap-2">
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
              .map((member) => (
                <MemberCard key={member.membershipId} member={member} />
              ))}
        </div>
      </div>
      {isModelOpen?.open && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-60 bg-opacity-50 z-40 w-screen h-screen"
            onClick={() => setIsModelOpen({ open: false, content: 0 })}
          />
          <div className="bg-white rounded-lg shadow-lg px-3 py-3 w-[800px] h-[500px] max-w-full max-h-full transform transition-all duration-300 animate-fade-in z-50">
            {isModelOpen?.content === 1 && (
              <InvitationModel
                suggestedUsers={suggestedUsers}
                setSuggestedUsers={setSuggestedUsers}
                setIsModelOpen={setIsModelOpen}
              />
            )}
            {isModelOpen?.content === 2 && (
              <InvitationsReviewModel
                invitations={invitations}
                setIsModelOpen={setIsModelOpen}
              />
            )}
            {isModelOpen?.content === 3 && (
              <JoinRequestReviewModel
                joinRequests={joinRequests}
                setIsModelOpen={setIsModelOpen}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationMember;
