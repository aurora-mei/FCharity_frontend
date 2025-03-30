import React, { useState, useEffect } from "react";

import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";
import ManagerLayout from "../../components/Layout/ManagerLayout";
import { IoSearch } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  createMemberInviteRequest,
  deleteInviteRequest,
  getAllUsersNotInOrganization,
  getOrganizationInviteRequests,
  getOrganizationMembers,
  fetchOrganizationMembers
} from "../../redux/organization/organizationSlice";

import organizationApi from "../../redux/organization/organizationApi.js";

import { FaRegCheckCircle } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";
import { SiPhpmyadmin } from "react-icons/si";
import { IoClose } from "react-icons/io5";
import { UserOutlined } from "@ant-design/icons";
import { fetchMyOrganization } from "../../redux/organization/organizationSlice";

const OrganizationMember = () => {
  const dispatch = useDispatch();

  const {
    selectedOrganization,
    managedOrganizations,
    inviteRequests,
    joinRequests,
  } = useSelector((state) => state.organization);

  console.log("organization invitation requests: ", inviteRequests);

  const [isModelOpen, setIsModelOpen] = useState({
    open: false,
    content: 0,
  });
  const { myOrganization } = useSelector(
      (state) => state.organization
    );
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};
  
    try {
      currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
      console.error("Error parsing currentUser from localStorage:", error);
      currentUser = {};
    }
  useEffect(() => {
      dispatch(fetchMyOrganization(currentUser.id))
    }, [dispatch]);

  useEffect(() => {
    if (myOrganization.organizationId) {
      dispatch(
        getOrganizationMembers(myOrganization.organizationId)
      );
    dispatch(
      fetchOrganizationMembers(myOrganization.organizationId)
    )
      dispatch(
        getAllUsersNotInOrganization(
          myOrganization.organizationId
        )
      );
    }
  }, [dispatch, myOrganization.organizationId]);

  const { myOrganizationMembers, usersOutside } = useSelector((state) => state.organization);

  useEffect(() => {
    setSuggestedUsers(
      usersOutside?.map((user) => ({ ...user, invited: false }))
    );
  }, [usersOutside]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleInvite = (user) => {
    try {
      const invitation = {
        userId: user.id,
        organizationId: myOrganization.organizationId,
      };
      dispatch(createMemberInviteRequest(invitation));
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u.userId === user.id ? { ...u, invited: true } : u
        )
      );
    } catch (error) {
      console.error("Failed to invite member:", error);
    }
  };

  const handleRemove = (user) => {
    setSuggestedUsers((prev) => prev.filter((u) => u.userId !== user.userId));
  };

  const handleDeleteInvitation = async (user) => {
    try {
      const invitation = {
        userId: user.id,
        organizationId: myOrganization.organizationId,
      };

      const requestId = await organizationApi
        .getInviteRequestId(
          myOrganization.organizationId,
          user.id
        )
        .then((res) => res.data);

      dispatch(deleteInviteRequest(requestId));

      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u.userId === user.userId ? { ...u, invited: false } : u
        )
      );
    } catch (error) {
      console.error("Failed to invite member:", error);
    }
  };

  return (
    <ManagerLayout>
      <div className="pl-2">
        <div className="inline-flex gap-2 items-baseline">
          <FaLink />
          <Link to={"/"} className="hover:underline">
            Home
          </Link>
        </div>
        <span> / </span>
        <Link to={"/manage-organization"} className="hover:underline">
          my-organization
        </Link>
        <span> / </span>
        <Link to={"/manage-organization/users"} className="hover:underline">
          members
        </Link>
      </div>
      <div className="m-10 rounded-xl shadow-md">
        <div className="flex items-center justify-between p-5">
          <p
            className="text-xl font-semibold"
            style={{ margin: 0, padding: 0 }}
          >
            Members
          </p>
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center justify-center">
              <label htmlFor="searchTerm" className="-mr-8 z-10">
                <IoSearch style={{ fontSize: "22px", color: "gray" }} />
              </label>
              <input
                type="text"
                name="searchTerm"
                id="searchTerm"
                placeholder="Search..."
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
            </div>
            <button
              type="button"
              className="text-gray-800 rounded-xl bg-gray-300 px-4 py-2 hover:bg-gray-400 hover:cursor-pointer transition duration-200"
              onClick={() => setIsModelOpen({ open: true, content: 1 })}
            >
              Mời tham gia
            </button>
            <button
              type="button"
              className="text-gray-800 rounded-xl bg-gray-300 px-4 py-2 hover:bg-gray-400 hover:cursor-pointer transition duration-200"
              onClick={() => {
                dispatch(
                  getOrganizationInviteRequests(
                    myOrganization.organizationId
                  )
                );
                setIsModelOpen({ open: true, content: 2 });
              }}
            >
              Lời mời đã gửi
            </button>
          </div>
        </div>
        <div className="p-5 grid md:grid-cols-1 lg:grid-cols-2 gap-2">
          {myOrganizationMembers.map((member, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-md flex justify-between items-center p-4 pb-6 relative"
            >
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
                {member.user.userStatus === "Verified" && (
                  <div className=" px-2 py-1 bg-green-500 text-white rounded-full flex gap-1 justify-between items-center">
                    <FaRegCheckCircle />{" "}
                    <span className="text-xs">Verified</span>
                  </div>
                )}
                {member.user.userStatus === "Unverified" && (
                  <div className=" px-2 py-1 bg-red-500 text-white rounded-full flex gap-1 justify-between items-center">
                    <IoWarningOutline />{" "}
                    <span className="text-xs">Unverified</span>
                  </div>
                )}
                {member.user.userRole === "Admin" && (
                  <div className=" px-2 py-1 bg-black text-white rounded-full flex gap-1 justify-between items-center">
                    <GrUserAdmin /> <span className="text-xs">Admin</span>
                  </div>
                )}
                {member.user.userRole === "CEO" && (
                  <div className=" px-2 py-1 bg-purple-600 text-white rounded-full flex gap-1 justify-between items-center">
                    <SiPhpmyadmin /> <span className="text-xs">CEO</span>
                  </div>
                )}
                {member.user.userRole === "Manager" && (
                  <div className=" px-2 py-1 bg-yellow-500 text-white rounded-full flex gap-1 justify-between items-center">
                    <MdManageAccounts />{" "}
                    <span className="text-xs">Manager</span>
                  </div>
                )}
                {member.user.userRole === "Member" && (
                  <div className=" px-2 py-1 bg-blue-500 text-white rounded-full flex gap-1 justify-between items-center">
                    <FaUser /> <span className="text-xs">Member</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModelOpen?.open && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-60 bg-opacity-50 z-40 w-screen h-screen"
            onClick={() => setIsModelOpen({ open: false, content: 0 })}
          />
          <div className="bg-white rounded-lg shadow-lg px-6 py-3 w-[800px] h-[500px] max-w-full max-h-full transform transition-all duration-300 animate-fade-in z-50">
            {isModelOpen?.content === 1 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p
                    className="text-xl font-semibold"
                    style={{ margin: 0, padding: 0 }}
                  >
                    Mời tham gia
                  </p>
                  <span
                    className="hover:cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
                    onClick={() => setIsModelOpen({ open: false, content: 0 })}
                  >
                    <IoClose style={{ fontSize: "24px" }} />
                  </span>
                </div>
                <div className="flex gap-2 h-[420px]">
                  <div className="w-[230px] h-full max-h-full  flex flex-col gap-2">
                    <div className="flex items-center justify-center pl-2">
                      <label htmlFor="searchTerm" className="-mr-8 z-10">
                        <IoSearch style={{ fontSize: "22px", color: "gray" }} />
                      </label>
                      <input
                        type="text"
                        name="searchTerm"
                        id="searchTerm"
                        placeholder="Tìm kiếm thành viên"
                        className="w-full pl-10 p-2 bg-gray-100 border border-gray-300 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
                      />
                    </div>
                    <span className="border-b border-gray-300" />
                    <div className="h-[375px] flex flex-col gap-2 ">
                      <p
                        className="font-semibold text-lg text-gray-800"
                        style={{ margin: 0, padding: 0 }}
                      >
                        {suggestedUsers?.length || "0"} ứng viên
                      </p>
                      <div className="overflow-y-scroll grow-1">
                        {suggestedUsers &&
                          suggestedUsers.length > 0 &&
                          suggestedUsers?.map((user, index) => (
                            <div
                              key={index}
                              className="hover:bg-gray-200 hover:cursor-pointer rounded-md flex justify-between items-center p-3 relative overflow-hidden gap-2"
                            >
                              <div className="flex items-center gap-2 grow-1">
                                <div className="w-10 h-10 rounded-xl overflow-hidden hover:cursor-pointer">
                                  <img
                                    src={"https://avatar.iran.liara.run/public"}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex flex-col gap-1 justify-center grow-1">
                                  <p
                                    className="font-semibold text-sm truncate max-w-[110px]"
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
                                            handleInvite(user);
                                          }}
                                        >
                                          Mời
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
                                          Xóa
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {user.invited && (
                                  <button
                                    type="button"
                                    className=" bg-gray-400 rounded-md hover:cursor-pointer hover:bg-gray-500"
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
                                    Hủy
                                  </button>
                                )}
                              </div>

                              <div className="absolute right-0 top-0 overflow-hidden rounded-bl-lg">
                                {user.userStatus === "Verified" && (
                                  <div className=" px-2 py-1 bg-green-500 text-white ">
                                    <FaRegCheckCircle
                                      style={{ fontSize: "10px" }}
                                    />
                                  </div>
                                )}
                                {user.userStatus === "Unverified" && (
                                  <div className=" px-2 py-1 bg-red-500 text-white ">
                                    <IoWarningOutline
                                      style={{ fontSize: "10px" }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-200 grow-1"></div>
                </div>
              </div>
            )}
            {isModelOpen?.content === 2 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p
                    className="text-xl font-semibold"
                    style={{ margin: 0, padding: 0 }}
                  >
                    Lời mời đã gửi
                  </p>
                  <span
                    className="hover:cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
                    onClick={() => setIsModelOpen({ open: false, content: 0 })}
                  >
                    <IoClose style={{ fontSize: "24px" }} />
                  </span>
                </div>

                <div className="relative shadow-md sm:rounded-lg flex flex-col gap-6">
                  <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white mt-1">
                    <div className="relative">
                      <button
                        className="inline-flex items-center bg-white border border-gray-300  hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 gap-2"
                        type="button"
                        style={{ color: "rgb(64, 67, 71)" }}
                      >
                        <span>Action</span>
                        <FaChevronDown />
                      </button>
                      {/* <!-- Dropdown menu --> */}
                      <div className="z-50 bg-white rounded-lg shadow-sm w-32 absolute top-8 text-sm text-gray-700 flex flex-col gap-1">
                        <button className="block px-4 py-2 hover:bg-gray-100 hover:cursor-pointer">
                          Hủy
                        </button>
                      </div>
                    </div>
                    <label htmlFor="table-search" className="sr-only">
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                        <IoSearch />
                      </div>
                      <input
                        type="text"
                        id="table-search-users"
                        className="block p-2 ps-10 text-sm text-gray-600 border border-gray-300 rounded-lg w-80 bg-gray-50"
                        placeholder="Search for users"
                        style={{ color: "rgb(64, 67, 71)" }}
                      />
                    </div>
                  </div>
                  <div className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="p-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 "
                            />
                            <label
                              htmlFor="checkbox-all-search"
                              className="sr-only"
                            >
                              checkbox
                            </label>
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 w-[220px]">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 w-[230px]">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 w-[150px]">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <div className="h-[300px] overflow-y-scroll">
                      {inviteRequests?.map((invitation, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b border-gray-200 hover:bg-gray-50 h-full"
                        >
                          <td className="w-4 p-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 "
                              />
                              <label
                                htmlFor="checkbox-table-search-1"
                                className="sr-only"
                              >
                                checkbox
                              </label>
                            </div>
                          </td>
                          <td
                            scope="row"
                            className="flex items-center px-6 py-4 text-gray-800 whitespace-nowrap w-[220px]"
                          >
                            <img
                              className="w-10 h-10 rounded-full"
                              src={invitation.user.avatar}
                              alt="avatar image"
                            />
                            <div className="ps-3">
                              <div className="text-base font-semibold">
                                {invitation.user.fullName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 w-[230px]">
                            {invitation.user.email}
                          </td>
                          <td className="px-6 py-4 w-[150px]">
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
                          </td>
                          <td className="px-6 py-4">
                            {invitation.status === "Pending" && (
                              <button
                                type="button"
                                className="px-3 py-1 rounded-md bg-gray-300 hover:bg-gray-500 hover:cursor-pointer hover:text-white"
                                style={{ color: "rgb(64, 67, 71)" }}
                              >
                                Hủy
                              </button>
                            )}
                            {invitation.status !== "Pending" && (
                              <button
                                type="button"
                                className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-700 hover:cursor-pointer hover:text-white"
                                style={{ color: "white" }}
                              >
                                Xóa
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ManagerLayout>
  );
};

export default OrganizationMember;
