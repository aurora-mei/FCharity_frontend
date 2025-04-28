import { APIPrivate } from "../../config/API/api";

// Fetch danh sách lời mời của user hiện tại
export const fetchMyInvitations = async (userId) => {
    try {
      const res = await APIPrivate.get(`projects/requests/my-invitations/${userId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching my invitations:", err);
      throw err.response?.data || err;
    }
  };

// Duyệt lời mời
export const approveInviteRequest = async (requestId) => {
    try {
        const response = await APIPrivate.post(`projects/requests/${requestId}/approve-join`);
        return response.data;
    } catch (error) {
        console.error("Error approving invite request:", error);
        throw error.response?.data || error;
    }
};

// Từ chối lời mời
export const rejectInviteRequest = async (requestId) => {
    try {
        const response = await APIPrivate.post(`projects/requests/${requestId}/reject-join`);
        return response.data;
    } catch (error) {
        console.error("Error rejecting invite request:", error);
        throw error.response?.data || error;
    }
};

const inviteRequestProjectApi = {
    fetchMyInvitations,
    approveInviteRequest,
    rejectInviteRequest,
};

export default inviteRequestProjectApi;