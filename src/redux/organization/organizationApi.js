import api from "../../services/api";
import { getManagedOrganizations } from "../auth/authSlice";

const organizationApi = {
  getAllOrganizations: () => api.get("/organizations"),
  createOrganization: (orgData) => api.post("/organizations", orgData),
  deleteOrganization: (organizationId) =>
    api.delete(`/organizations/${organizationId}`),
  getOrganization: (organizationId) =>
    api.get(`/organizations/${organizationId}`),
  updateOrganization: (organizationId, orgData) =>
    api.put(`/organizations/${organizationId}`, orgData),

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
  inviteMember: (invitationData) => api.post("/invitations", invitationData),

  transferCEO: (organizationId, newCeoId) =>
    api.put(`/organizations/${organizationId}/transfer-ceo`, {
      new_ceo_id: newCeoId,
    }),

  getManagedOrganizations: () => api.get("/organizations/managed"),

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
};

export default organizationApi;
