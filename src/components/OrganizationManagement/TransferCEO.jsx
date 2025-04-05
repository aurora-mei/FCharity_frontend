import React, { useState, useEffect } from "react";
import apiService from "../../services/api";

const TransferCEO = ({ organizationId }) => {
  const [members, setMembers] = useState([]);
  const [newCeoId, setNewCeoId] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await apiService.getOrganizationMembers(
          organizationId
        );
        setMembers(response.data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    };
    fetchMembers();
  }, [organizationId]);

  const handleTransfer = async () => {
    if (!newCeoId) {
      alert("Please select a new CEO.");
      return;
    }
    try {
      await apiService.transferCEO(organizationId, newCeoId);
      alert("CEO transferred successfully!");
      setNewCeoId("");
    } catch (err) {
      console.error("Failed to transfer CEO:", err);
      alert("Failed to transfer CEO");
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">
        Transfer CEO
      </h2>
      <div className="flex flex-col gap-4 max-w-md">
        <label className="text-gray-700">Select New CEO:</label>
        <select
          value={newCeoId}
          onChange={(e) => setNewCeoId(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition duration-300"
        >
          <option value="">-- Select Member --</option>
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.full_name} ({member.email})
            </option>
          ))}
        </select>
        <button
          onClick={handleTransfer}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
        >
          Transfer CEO
        </button>
      </div>
    </div>
  );
};

export default TransferCEO;
