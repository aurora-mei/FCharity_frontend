import React, { useState, useEffect } from "react";
import apiService from "../../services/api";

const JoinRequests = ({ organizationId }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchJoinRequests = async () => {
      try {
        const response = await apiService.getJoinRequestsByOrganizationId(
          organizationId
        );
        // console.log(response.data);
        setRequests(response.data);
      } catch (err) {
        console.error("Failed to fetch join requests:", err);
      }
    };
    fetchJoinRequests();
  }, [organizationId]);

  const handleUpdateRequest = async (joinRequest, status) => {
    try {
      joinRequest.status = status;
      // console.log("joinRequest: ---- ", joinRequest);
      await apiService.updateJoinRequest(joinRequest);
      setRequests(
        requests.filter(
          (req) => req.inviteJoinRequestId !== joinRequest.inviteJoinRequestId
        )
      );
      alert(`Request ${status} successfully!`);
    } catch (err) {
      // console.error("Failed to update request:", err);
      alert("Failed to update request");
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">
        Join Requests
      </h2>
      {requests.length === 0 ? (
        <p className="text-gray-500 text-center">No join requests found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold text-gray-700">
                User
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Message
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">CV</th>
              <th className="p-3 text-center font-semibold text-gray-700">
                Actions
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.inviteJoinRequestId}
                className="border-b border-gray-200 hover:bg-gray-50 transition duration-300"
              >
                <td className="p-3 text-gray-700">
                  {req.user?.fullName || "Unknown"}
                </td>
                <td className="p-3 text-gray-700">
                  {req.content || "No message"}
                </td>
                <td>
                  {req.cvLocation ? (
                    <a
                      href={req.cvLocation}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      View CV
                    </a>
                  ) : (
                    <a
                      href={
                        "http://localhost:8080/uploads/Dynamic-Programing.pdf"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      View CV
                    </a>
                  )}
                </td>
                <td className="p-3 flex justify-center gap-2">
                  {req.status == "Pending" ? (
                    <>
                      <button
                        onClick={() => handleUpdateRequest(req, "Approved")}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateRequest(req, "Rejected")}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                      >
                        Reject
                      </button>{" "}
                    </>
                  ) : (
                    <p></p>
                  )}
                </td>
                <td className="p-3 text-center">{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default JoinRequests;
