import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "https://fcharity.azurewebsites.net/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// const apiService = {
//   getCurrentUser: () => api.get("/users/me"),

//   login: (credentials) => api.post("/auth/login", credentials),

//   signup: (userData) => api.post("/auth/signup", userData),

//   verifyOtp: (otpData) => api.post("/auth/otp-verification", otpData),

//   // For admin
//   getAllOrganizations: () => api.get("/organizations"),
//   createOrganization: (orgData) => api.post("/organizations", orgData),
//   deleteOrganization: (organizationId) =>
//     api.delete(`/organizations/${organizationId}`),

//   // For admin, manager
//   getOrganization: (organizationId) =>
//     api.get(`/organizations/${organizationId}`),
//   updateOrganization: (organizationId, orgData) =>
//     api.put(`/organizations/${organizationId}`, orgData),

//   getAllRequests: () => api.get("/requests"),
//   getAllRequestsByOrganization: (organizationId) =>
//     api.get(`/requests?organization_id=${organizationId}`),

//   getAllReports: () => api.get("/reports"),
//   getAllReportsByOrganization: (organizationId) =>
//     api.get(`/reports?organization_id=${organizationId}`),

//   getOrganizationMembers: (organizationId) =>
//     api.get(`/organization-members/${organizationId}`),

//   removeOrganizationMember: (membershipId) =>
//     api.delete(`/organization-members/${membershipId}`),

//   getJoinRequestsByOrganizationId: (organizationId) =>
//     api.get(`/join-requests/organizations/${organizationId}`),

//   updateJoinRequest: (inviteJoinRequest) => {
//     console.log("inviteJoinRequest in api: ", inviteJoinRequest);
//     return api.put(`/join-requests`, inviteJoinRequest);
//   },

//   deleteJoinRequest: (requestId) => api.delete(`/join-requests/${requestId}`),

//   searchUsers: (searchTerm) => api.get(`/users?search=${searchTerm}`),

//   inviteMember: (invitationData) => api.post("/invitations", invitationData),

//   transferCEO: (organizationId, newCeoId) =>
//     api.put(`/organizations/${organizationId}/transfer-ceo`, {
//       new_ceo_id: newCeoId,
//     }),

//   donate: (donationData) => api.post("/donate", donationData),

//   getAllUsers: () => api.get("/users"),

//   deleteUser: (userId) => api.delete(`/users/${userId}`),
// };

// export default apiService;
