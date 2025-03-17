import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrganizationMembers,
  removeOrganizationMember,
} from "../../redux/organization/organizationSlice";

const OrganizationMembers = ({ organizationId }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrganizationMembers(organizationId));
  }, [dispatch, organizationId]);

  const { members } = useSelector((state) => state.organizations);

  const handleRemoveMember = (membershipId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        dispatch(removeOrganizationMember(membershipId));
        alert("Member removed successfully!");
      } catch (err) {
        console.error("Failed to remove member:", err);
        alert("Failed to remove member");
      }
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">
        Organization Members
      </h2>
      {members.length === 0 ? (
        <p className="text-gray-500 text-center">No members found.</p>
      ) : (
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Role
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.membershipId}
                className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
              >
                <td className="p-3 text-gray-700" data-label="Name">
                  {member.user?.fullName || "Unknown"}
                </td>
                <td className="p-3 text-gray-700" data-label="Email">
                  {member.user?.email || "N/A"}
                </td>
                <td className="p-3 text-gray-700" data-label="Role">
                  {member.role || "Member"}
                </td>
                <td className="p-3" data-label="Actions">
                  <button
                    onClick={() => handleRemoveMember(member.membershipId)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrganizationMembers;
