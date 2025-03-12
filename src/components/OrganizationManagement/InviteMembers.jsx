import React, { useState } from "react";
import apiService from "../../services/api";

const InviteMembers = ({ organizationId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await apiService.searchUsers(searchTerm);
      setSearchResults(
        response.data.filter((user) => !invitedUsers.includes(user.user_id))
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
    <div className="p-5">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">
        Invite Members
      </h2>
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        <ul className="space-y-3">
          {searchResults.map((user) => (
            <li
              key={user.user_id}
              className="flex justify-between items-center p-3 border-b border-gray-200"
            >
              <span className="text-gray-700">
                {user.full_name} ({user.email})
              </span>
              <button
                onClick={() => handleInvite(user.user_id)}
                disabled={invitedUsers.includes(user.user_id)}
                className={`px-4 py-2 rounded-lg text-white ${
                  invitedUsers.includes(user.user_id)
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
  );
};

export default InviteMembers;
