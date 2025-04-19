import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { Empty } from "antd";
import { useDispatch } from "react-redux";
import { cancelInvitationRequest } from "../../../redux/organization/organizationSlice";

const InvitationsReviewModel = ({ invitations, setIsModelOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByStatus, setFilterByStatus] = useState("All");
  const dispatch = useDispatch();

  const filteredInvitations = invitations
    ?.filter((invitation) => {
      if (
        searchTerm === "" ||
        invitation.user.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invitation.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return true;
      }
      return false;
    })
    .filter((invitation) => {
      if (filterByStatus === "All" || invitation.status === filterByStatus) {
        return true;
      }
      return false;
    });

  const handleDeleteInvitation = (invitation) => {
    dispatch(cancelInvitationRequest(invitation.invitationId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-xl font-semibold" style={{ margin: 0, padding: 0 }}>
          Invitations have sent
        </p>
        <span
          className="hover:cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
          onClick={() => setIsModelOpen({ open: false, content: 0 })}
        >
          <IoClose style={{ fontSize: "24px" }} />
        </span>
      </div>

      <div className="relative shadow-md sm:rounded-lg flex flex-col gap-4 ">
        <div className="flex items-center justify-between mx-2">
          <div className="relative">
            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
              <IoSearch />
            </div>
            <input
              type="text"
              id="table-search-users"
              className="w-full pl-10 p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-green-400 transition duration-200"
              placeholder="Search for users"
              style={{ color: "rgb(64, 67, 71)" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-green-400 transition duration-200"
              style={{ color: "rgb(64, 67, 71)" }}
              onChange={(e) => setFilterByStatus(e.target.value)}
              value={filterByStatus}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-700 font-semibold ml-2">
          Results :{invitations.length}
        </div>
        <div className="text-sm text-gray-500">
          <div className="text-xs text-gray-700 uppercase bg-gray-50">
            <div className="grid grid-cols-6 ">
              <div className="px-6 py-3 col-span-2">Name</div>
              <div scope="col" className="px-6 py-3 col-span-2">
                Email
              </div>
              <div scope="col" className="px-6 py-3 col-span-1">
                Status
              </div>
              <div scope="col" className="px-6 py-3 col-span-1">
                Action
              </div>
            </div>
          </div>
          <div className="h-[300px] overflow-y-scroll">
            {filteredInvitations && filteredInvitations.length > 0 ? (
              filteredInvitations.map((invitation, index) => (
                <div
                  key={index}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50 grid grid-cols-6"
                >
                  <div className="flex items-center px-6 py-4 text-gray-800 col-span-2">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={
                        invitation.user?.avatar ||
                        "https://avatar.iran.liara.run/public"
                      }
                      alt="avatar image"
                    />
                    <div className="ps-3">
                      <div className="text-base font-semibold">
                        {invitation.user.fullName}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4  col-span-2">
                    {invitation.user.email}
                  </div>
                  <div className="px-6 py-4  col-span-1">
                    <div className="flex items-center">
                      {invitation.status === "Pending" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 me-2"></div>
                      )}
                      {invitation.status === "Approved" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div>
                      )}
                      {invitation.status === "Rejected" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div>
                      )}
                      {invitation.status}
                    </div>
                  </div>
                  <div className="px-6 py-4  col-span-1">
                    {invitation.status === "Pending" && (
                      <button
                        type="button"
                        className="px-3 py-1 rounded-md bg-gray-300 hover:bg-gray-500 hover:cursor-pointer hover:text-white"
                        style={{ color: "rgb(64, 67, 71)" }}
                        onClick={() => {
                          handleDeleteInvitation(invitation);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    {invitation.status !== "Pending" && (
                      <button
                        type="button"
                        className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-700 hover:cursor-pointer hover:text-white"
                        style={{ color: "white" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Empty>No invitation has sent.</Empty>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsReviewModel;
