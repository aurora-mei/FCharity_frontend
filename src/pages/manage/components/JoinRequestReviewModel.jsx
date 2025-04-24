import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { Empty } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptJoinRequest,
  getAllJoinRequestsByOrganizationId,
  getAllMembersInOrganization,
  rejectJoinRequest,
} from "../../../redux/organization/organizationSlice";

const JoinRequestReviewModel = ({ setIsModelOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByStatus, setFilterByStatus] = useState("All");

  const dispatch = useDispatch();

  const joinRequests = useSelector((state) => state.organization.joinRequests);
  const ownedOrganization = useSelector(
    (state) => state.organization.ownedOrganization
  );

  useEffect(() => {
    if (ownedOrganization?.organizationId) {
      dispatch(
        getAllJoinRequestsByOrganizationId(ownedOrganization.organizationId)
      );
    }
  }, [dispatch, ownedOrganization]);

  const filteredJoinRequests = joinRequests
    ?.filter((joinRequest) => {
      if (
        searchTerm === "" ||
        joinRequest.user.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        joinRequest.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return true;
      }
      return false;
    })
    .filter((joinRequest) => {
      if (filterByStatus === "All" || joinRequest.status === filterByStatus) {
        return true;
      }
      return false;
    });

  const handleAcceptJoinRequest = async (joinRequest) => {
    await dispatch(
      acceptJoinRequest(joinRequest.organizationRequestId)
    ).unwrap();
    dispatch(getAllMembersInOrganization(ownedOrganization.organizationId));
  };

  const handleRejectJoinRequest = (joinRequest) => {
    dispatch(rejectJoinRequest(joinRequest.organizationRequestId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-xl font-semibold" style={{ margin: 0, padding: 0 }}>
          Join Requests
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
          Results :{joinRequests.length}
        </div>
        <div className="text-sm text-gray-500">
          <div className="text-xs text-gray-700 uppercase bg-gray-50">
            <div className="grid grid-cols-9 ">
              <div className="px-3 py-2 col-span-3">Name</div>
              <div scope="col" className="px-3 py-2 col-span-3">
                Email
              </div>
              <div scope="col" className="px-3 py-2 col-span-1">
                Status
              </div>
              <div
                scope="col"
                className="px-3 py-2 col-span-2 flex justify-center -ml-6"
              >
                Action
              </div>
            </div>
          </div>
          <div className="h-[300px] overflow-y-scroll">
            {filteredJoinRequests && filteredJoinRequests.length > 0 ? (
              filteredJoinRequests.map((joinRequest, index) => (
                <div
                  key={index}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50 grid grid-cols-9"
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2 text-gray-800 col-span-3 hover:cursor-pointer"
                    onClick={() => {
                      //TODO: navigate to user profile
                    }}
                  >
                    <img
                      className="w-10 h-10 rounded-full"
                      src={
                        joinRequest?.user?.avatar ||
                        "https://avatar.iran.liara.run/public"
                      }
                      alt="avatar image"
                    />

                    <div className="text-base font-semibold hover:underline">
                      {joinRequest.user.fullName}
                    </div>
                  </div>
                  <div className="px-3 py-2 col-span-3 flex items-center">
                    {joinRequest.user.email}
                  </div>
                  <div className="px-3 py-2  col-span-1  flex items-center">
                    <div className="flex items-center">
                      {joinRequest.status === "Pending" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 me-2"></div>
                      )}
                      {joinRequest.status === "Approved" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div>
                      )}
                      {joinRequest.status === "Rejected" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div>
                      )}
                      {joinRequest.status}
                    </div>
                  </div>
                  <div className="px-3 py-2 col-span-2 flex items-center justify-center">
                    {joinRequest.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-700 hover:cursor-pointer hover:text-white"
                          style={{ color: "white" }}
                          onClick={() => {
                            handleAcceptJoinRequest(joinRequest);
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-md  bg-red-500 hover:bg-red-600 hover:cursor-pointer hover:text-white"
                          style={{ color: "rgb(64, 67, 71)" }}
                          onClick={() => {
                            handleRejectJoinRequest(joinRequest);
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {joinRequest.status !== "Pending" && (
                      <div className="flex justify-center items-center">
                        No action
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Empty>No Join Request has received.</Empty>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestReviewModel;
