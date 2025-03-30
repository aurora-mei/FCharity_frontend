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
  updateJoinRequest: (inviteJoinRequest) => {
    // console.log("inviteJoinRequest in api: ", inviteJoinRequest);
    return api.put(`/join-requests`, inviteJoinRequest);
  },
  deleteJoinRequest: (requestId) => api.delete(`/join-requests/${requestId}`),

  getOrganizationInviteRequests: (organizationId) =>
    api.get(`/invite-requests/organizations/${organizationId}`),

  inviteMember: (requestInfo) => api.post("/invite-requests", requestInfo),
  getInviteRequestId: (organizationId, userId) =>
    api.get(`/invite-requests/request-id/${organizationId}/${userId}`),
  updateInviteRequest: (inviteRequest) => {
    return api.put(`/invite-requests`, inviteRequest);
  },
  deleteInviteRequest: (requestId) =>
    api.delete(`/invite-requests/${requestId}`),

  transferCEO: (organizationId, newCeoId) =>
    api.put(`/organizations/${organizationId}/transfer-ceo`, {
      new_ceo_id: newCeoId,
    }),

  getManagedOrganizations: () => api.get("/organizations/managed"),

  getAllUsersNotInOrganization: (organizationId) =>
    api.get(`/users/outside/${organizationId}`),

  //   getCurrentUser: () => api.get("/users/me"),

  //   login: (credentials) => api.post("/auth/login", credentials),

  //   signup: (userData) => api.post("/auth/signup", userData),

  //   verifyOtp: (otpData) => api.post("/auth/otp-verification", otpData),

  //   getAllRequests: () => api.get("/requests"),
  //   getAllRequestsByOrganization: (organizationId) =>
  //     api.get(`/requests?organization_id=${organizationId}`),

  //   getAllReports: () => api.get("/reports"),
  //   getAllReportsByOrganization: (organizationId) =>
  //     api.get(`/reports?organization_id=${organizationId}`),

  //   searchUsers: (searchTerm) => api.get(`/users?search=${searchTerm}`),

  //   donate: (donationData) => api.post("/donate", donationData),

  //   getAllUsers: () => api.get("/users"),

  //   deleteUser: (userId) => api.delete(`/users/${userId}`),

  getAllRequests: () => api.get("/requests"),
  getAllRequestsByOrganization: (organizationId) =>
    api.get(`/requests?organization_id=${organizationId}`),
  getAllReports: () => api.get("/reports"),
  getAllReportsByOrganization: (organizationId) =>
    api.get(`/reports?organization_id=${organizationId}`),
  donate: (donationData) => api.post("/donate", donationData),
  getAllJoinRequestByOrganizationId: (organizationId) =>
    api.get("/join-requests/organizations/${organizationId}"),
  getJoinRequestById: (joinRequestId) =>
    api.get(`/join-requests/${joinRequestId}`),
  getJoinRequestByUserId: (userId) => api.get(`/join-requests/users/${userId}`),
  createJoinRequest: (joinRequestData) =>
    api.post("/join-requests", joinRequestData),
  updateJoinRequest: (joinRequestData) =>
    api.put(`/join-requests`, joinRequestData),
  deleteJoinRequest: (joinRequestId) =>
    api.delete(`/join-requests/${joinRequestId}`),
};

export default organizationApi;
