import React, { useEffect, useState } from "react";
import {
  getOrganizationInviteRequests,
  createMemberInviteRequest,
} from "../../redux/organization/organizationSlice";
import { getAllUsersNotInOrganization } from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

import { DeleteOutlined, DeleteFilled } from "@ant-design/icons";

const InviteMembers = ({ organizationId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openSearchResultBox, setOpenSearchResultBox] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsersNotInOrganization(organizationId));
    dispatch(getOrganizationInviteRequests(organizationId));
  }, [dispatch, organizationId]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const { inviteRequests } = useSelector((state) => state.organizations);
  const { usersOutside } = useSelector((state) => state.user);

  console.log("User Outside:", usersOutside);
  console.log("Invitations: ", inviteRequests);

  const handleSearch = () => {
    console.log("Search term: ", searchTerm);
    if (searchTerm === "") {
      setSearchResults([]);
      setOpenSearchResultBox(false);
      return;
    }

    if (!openSearchResultBox) {
      setOpenSearchResultBox(true);
    }

    try {
      setSearchResults(
        usersOutside?.filter(
          (user) =>
            !inviteRequests.includes(user.userId) &&
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } catch (err) {
      console.error("Failed to search users:", err);
    }
  };

  const handleInvite = async (userId) => {
    try {
      dispatch(createMemberInviteRequest({ organizationId, userId }));
      dispatch(getOrganizationInviteRequests(organizationId));
      setOpenSearchResultBox(false);
    } catch (err) {
      console.error("Failed to invite member:", err);
    }
  };

  return (
    <div className="min-h-[200px]">
      <div className="relative mb-28">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5">
          Invite Members
        </h2>
        <div className="flex gap-3 mb-5">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            placeholder="Search users by name or email"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Search
          </button>
        </div>
        <div className="absolute">
          <p>Search results:</p>
          {openSearchResultBox && (
            <div>
              {searchResults.length > 0 ? (
                <ul className="absolute flex flex-col gap-1 max-h-52 overflow-y-scroll ml-10 p-2 bg-white rounded-sm shadow-md">
                  {searchResults.map((user) => (
                    <li
                      key={user.userId}
                      className="flex justify-between items-center p-3 bg-white rounded-lg shadow-md gap-10 cursor-pointer hover:bg-blue-200"
                    >
                      <div className="flex gap-3 items-center">
                        <img
                          className="w-[40px] h-[40px] rounded-full bg-amber-200 object-cover"
                          src={
                            "https://cdn.pixabay.com/photo/2020/03/17/12/02/vietnam-4940065_1280.jpg"
                          }
                          alt=""
                        />
                        <div className="text-gray-700 flex flex-col gap-2">
                          <div>{user.fullName}</div>
                          <div>{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInvite(user.userId)}
                        disabled={
                          inviteRequests.filter(
                            (invite) => invite.user.userId == user.userId
                          ).length > 0
                        }
                        className={`px-4 py-2 rounded-lg text-white cursor-pointer ${
                          inviteRequests.filter(
                            (invite) => invite.user.userId == user.userId
                          ).length > 0
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        } transition duration-300`}
                      >
                        Invite
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center ml-10">
                  No users found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-5">
          Invitations
        </h2>
        <div className="ml-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[400px] overflow-y-scroll">
          {inviteRequests.map((invite) => (
            <div className="rounded-lg shadow-lg p-2 w-[350px] h-[80px] flex justify-between items-center bg-blue-100 relative">
              <div className="flex gap-2">
                <img
                  className="w-[65px] h-[65px] rounded-full bg-amber-200 object-cover"
                  src="https://cdn.pixabay.com/photo/2020/03/17/12/02/vietnam-4940065_1280.jpg"
                  alt="user avatar"
                />

                <div className="flex flex-col justify-center gap-3">
                  <div>{invite?.user?.fullName}</div>
                  <div>{invite?.user?.email}</div>
                </div>
              </div>
              <div className="self-end cursor-pointer hover:text-red-600">
                <DeleteOutlined className="" />
              </div>
              <div
                className={`absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-2 py-1 text-white ${
                  invite?.status == "Approved"
                    ? "bg-green-600"
                    : invite?.status == "Rejected"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {invite?.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InviteMembers;
