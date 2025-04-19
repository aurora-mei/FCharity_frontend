import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { createInvitationRequest } from "../../../redux/organization/organizationSlice";
import UserInfoCard from "./UserInfoCard";

const InvitationModel = ({
  suggestedUsers,
  setSuggestedUsers,
  setIsModelOpen,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const { ownedOrganization } = useSelector((state) => state.organization);

  const handleInvitation = (user) => {
    try {
      const invitation = {
        userId: user.id,
        organizationId: ownedOrganization.organizationId,
      };
      dispatch(createInvitationRequest(invitation));
      setSuggestedUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, invited: true } : u))
      );
    } catch (error) {
      console.error("Failed to invite member:", error);
    }
  };

  const handleRemove = (user) => {
    setSuggestedUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleDeleteInvitation = async (user) => {
    try {
      const invitation = {
        userId: user.id,
        organizationId: ownedOrganization.organizationId,
      };

      const requestId = await organizationApi
        .getInvitationRequestById(ownedOrganization.organizationId, user.id)
        .then((res) => res.data);

      dispatch(cancelInvitationRequest(requestId));
      setSuggestedUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, invited: false } : u))
      );
    } catch (error) {
      console.error("Failed to invite member:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-xl font-semibold" style={{ margin: 0, padding: 0 }}>
          Invite new member
        </p>
        <span
          className="hover:cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
          onClick={() => setIsModelOpen({ open: false, content: 0 })}
        >
          <IoClose style={{ fontSize: "24px" }} />
        </span>
      </div>
      <div className="flex gap-1">
        <div className="h-full max-h-full flex flex-col gap-2 w-[290px] shrink-0">
          <div className="flex items-center justify-center pl-2">
            <label htmlFor="searchTerm" className="-mr-8 z-10">
              <IoSearch style={{ fontSize: "22px", color: "gray" }} />
            </label>
            <input
              type="text"
              name="searchTerm"
              id="searchTerm"
              placeholder="Find users..."
              className="w-full pl-10 p-2 bg-gray-100 border border-gray-300 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-green-400 transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="border-b border-gray-300" />
          <div className="h-[375px] flex flex-col gap-2 ">
            <p
              className="font-semibold text-lg text-gray-800"
              style={{ margin: 0, padding: 0 }}
            >
              {suggestedUsers?.length || "0"} users found
            </p>

            <div className="overflow-y-scroll grow-1 pr-3">
              {suggestedUsers &&
                suggestedUsers.length > 0 &&
                suggestedUsers
                  ?.filter((user) => {
                    if (
                      searchTerm === "" ||
                      user.fullName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      user.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    ) {
                      return true;
                    }
                    return false;
                  })
                  .map((user, index) => (
                    <div
                      key={index}
                      className="hover:bg-gray-200 hover:cursor-pointer rounded-md flex justify-between items-center p-3 relative overflow-hidden gap-2"
                      onClick={() => {
                        setSelectedUser(user);
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden hover:cursor-pointer">
                        <img
                          src={
                            user.avatar ||
                            "https://avatar.iran.liara.run/public"
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1 justify-center grow-1">
                        <p
                          className="font-semibold text-sm truncate max-w-[180px]"
                          style={{ margin: 0, padding: 0 }}
                        >
                          {user.fullName}
                        </p>

                        <div className=" flex flex-row-reverse items-center">
                          {!user.invited && (
                            <div className="flex justify-between items-center gap-3 grow-1">
                              <button
                                type="button"
                                className=" bg-green-400 rounded-md grow-1 hover:cursor-pointer hover:bg-green-500"
                                style={{
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  padding: "3px 5px",
                                }}
                                onClick={() => {
                                  handleInvitation(user);
                                }}
                              >
                                Invite
                              </button>
                              <button
                                type="button"
                                className=" bg-gray-400 rounded-md grow-1  hover:cursor-pointer hover:bg-gray-500"
                                style={{
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  padding: "3px 5px",
                                }}
                                onClick={() => {
                                  handleRemove(user);
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                          {user.invited && (
                            <button
                              type="button"
                              className=" bg-gray-400 rounded-md w-1/2 hover:cursor-pointer hover:bg-gray-500"
                              style={{
                                color: "white",
                                fontSize: "12px",
                                fontWeight: "bold",
                                padding: "3px 15px",
                              }}
                              onClick={() => {
                                handleDeleteInvitation(user);
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="absolute right-0 top-0 overflow-hidden rounded-bl-lg">
                        {user.userStatus === "Verified" && (
                          <div className=" px-2 py-1 bg-green-500 text-white ">
                            <FaRegCheckCircle style={{ fontSize: "10px" }} />
                          </div>
                        )}
                        {user.userStatus === "Unverified" && (
                          <div className=" px-2 py-1 bg-red-500 text-white ">
                            <IoWarningOutline style={{ fontSize: "10px" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <UserInfoCard
          selectedUser={selectedUser}
          handleInvitation={handleInvitation}
          handleDeleteInvitation={handleDeleteInvitation}
        />
      </div>
    </div>
  );
};

export default InvitationModel;
