import React, { useEffect, useState } from "react";
import { getOrganizationInviteRequests } from "../../redux/organization/organizationSlice";
import { getAllUsersNotInOrganization } from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

const InviteMembers = ({ organizationId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsersNotInOrganization(organizationId));
    dispatch(getOrganizationInviteRequests(organizationId));
  }, [dispatch, organizationId]);

  const { inviteRequests } = useSelector((state) => state.organizations);
  const { usersOutside } = useSelector((state) => state.user);

  console.log("User Outside:", usersOutside);
  console.log("Invitations: ", inviteRequests);

  const handleSearch = async () => {
    try {
      setSearchResults(
        usersOutside.filter(
          (user) =>
            !inviteRequests.includes(user.userId) &&
            searchTerm != "" &&
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } catch (err) {
      console.error("Failed to search users:", err);
    }
  };

  const handleInvite = async (userId) => {
    try {
      await apiService.inviteMember({
        organization_id: organizationId,
        user_id: userId,
      });
      setInvitedUsers([...invitedUsers, userId]);
      setSearchResults(searchResults.filter((user) => user.user_id !== userId));
      alert("Invitation sent successfully!");
    } catch (err) {
      console.error("Failed to invite member:", err);
      alert("Failed to invite member");
    }
  };

  return (
    <div className="min-h-[200px]">
      <div className="">
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
        {searchResults.length > 0 ? (
          <ul className="space-y-3 bg-gray-200">
            {searchResults.map((user) => (
              <li
                key={user.userId}
                className="flex justify-between items-center p-3 border-b border-gray-200"
              >
                <span className="text-gray-700">
                  {user.fullName} ({user.email})
                </span>
                <button
                  onClick={() => handleInvite(user.userId)}
                  disabled={invitedUsers.includes(user.userId)}
                  className={`px-4 py-2 rounded-lg text-white ${
                    invitedUsers.includes(user.userId)
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
          <p className="text-gray-500 text-center">No users found.</p>
        )}
      </div>
      <div className="grid grid-cols-3">
        {inviteRequests.map((invite) => (
          <div className="bg-white rounded-lg shadow-lg p-2 w-[290px] h-[80px] flex justify-between items-center border-b-cyan-400 border-2">
            <img
              className="w-[65px] h-[65px] rounded-full bg-amber-200 object-cover"
              src="https://cdn.pixabay.com/photo/2020/03/17/12/02/vietnam-4940065_1280.jpg"
              alt="user avatar"
            />

            <div className="flex flex-col justify-around">
              <p>Full name</p>
              <p>Email</p>
            </div>
            <div>Pending</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteMembers;
