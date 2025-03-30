import api from "../../services/api";

const organizationApi = {
  getAllOrganizations: () => api.get("/organizations"),
  createOrganization: (orgData) => api.post("/organizations", orgData),
  deleteOrganization: (organizationId) =>
    api.delete(`/organizations/${organizationId}`),
  getOrganization: (organizationId) =>
    api.get(`/organizations/${organizationId}`),
  updateOrganization: (orgData) => api.put(`/organizations`, orgData),

  getOrganizationMembers: (organizationId) =>
    api.get(`/organization-members/${organizationId}`),
  removeOrganizationMember: (membershipId) =>
    api.delete(`/organization-members/${membershipId}`),

  getJoinRequestsByOrganizationId: (organizationId) =>
    api.get(`/join-requests/organizations/${organizationId}`),
  updateJoinRequest: (inviteJoinRequest) =>
    api.put(`/join-requests`, inviteJoinRequest),
  deleteJoinRequest: (requestId) => api.delete(`/join-requests/${requestId}`),

  getOrganizationInviteRequests: (organizationId) =>
    api.get(`/invite-requests/organizations/${organizationId}`),
  inviteMember: (requestInfo) => api.post("/invite-requests", requestInfo),
  getInviteRequestId: (organizationId, userId) =>
    api.get(`/invite-requests/request-id/${organizationId}/${userId}`),
  updateInviteRequest: (inviteRequest) => 
    api.put(`/invite-requests`, inviteRequest),
  deleteInviteRequest: (requestId) =>
    api.delete(`/invite-requests/${requestId}`),

  transferCEO: (organizationId, newCeoId) =>
    api.put(`/organizations/${organizationId}/transfer-ceo`, {
      new_ceo_id: newCeoId,
    }),

  getManagedOrganizations: () => api.get("/organizations/managed"),
  getAllUsersNotInOrganization: (organizationId) =>
    api.get(`/users/outside/${organizationId}`),

  getAllRequests: () => api.get("/requests"),
  getAllRequestsByOrganization: (organizationId) =>
    api.get(`/requests?organization_id=${organizationId}`),
  getAllReports: () => api.get("/reports"),
  getAllReportsByOrganization: (organizationId) =>
    api.get(`/reports?organization_id=${organizationId}`),
  donate: (donationData) => api.post("/donate", donationData),

  getAllJoinRequestByOrganizationId: (organizationId) =>
    api.get(`/join-requests/organizations/${organizationId}`),
  getJoinRequestById: (joinRequestId) =>
    api.get(`/join-requests/${joinRequestId}`),
  getJoinRequestByUserId: (userId) => api.get(`/join-requests/users/${userId}`),
  createJoinRequest: (joinRequestData) =>
    api.post("/join-requests", joinRequestData),

  getMyOrganization: async (userId) => {
    try {
      const response = await api.get(`/organizations/my-organization/${userId}`);
      console.log("My org:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error get my org:", err);
      throw err.response?.data;
    }
  },

  getOrganizationMembers: async (organizationId) => {
    try {
      const response = await api.get(`/organization-members/${organizationId}`);
      console.log("organizationId members:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error get org members:", err);
      throw err.response?.data;
    }
  }
};

export default organizationApi;
