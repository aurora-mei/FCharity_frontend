
import { APIPrivate } from "../../config/API/api";

// Fetch danh sách lời mời tham gia tổ chức của user hiện tại
export const fetchMyOrgInvitations = async (userId) => {
    try {
        // Corresponds to: GET /api/invitation-requests/users/{userId}
        const res = await APIPrivate.get(`/api/invitation-requests/users/${userId}`);
        return res.data; // Assuming the backend returns the list directly
    } catch (err) {
        console.error("Error fetching my organization invitations:", err);
        throw err.response?.data || err;
    }
};

// User chấp nhận lời mời tham gia tổ chức
export const acceptOrgInvitationRequest = async (invitationId) => {
    try {
        // Corresponds to: PUT /api/invitation-requests/{invitationRequestId}/accept
        const response = await APIPrivate.put(`/api/invitation-requests/${invitationId}/accept`);
        return response.data;
    } catch (error) {
        console.error("Error accepting organization invitation request:", error);
        throw error.response?.data || error;
    }
};

// User từ chối lời mời tham gia tổ chức
export const rejectOrgInvitationRequest = async (invitationId) => {
    try {
        // Corresponds to: PUT /api/invitation-requests/{invitationRequestId}/reject
        const response = await APIPrivate.put(`/api/invitation-requests/${invitationId}/reject`);
        return response.data;
    } catch (error) {
        console.error("Error rejecting organization invitation request:", error);
        throw error.response?.data || error;
    }
};

const inviteRequestOrganizationApi = {
    fetchMyOrgInvitations,
    acceptOrgInvitationRequest,
    rejectOrgInvitationRequest,
};

export default inviteRequestOrganizationApi;