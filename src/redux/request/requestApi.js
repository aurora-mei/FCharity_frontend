import api from "../../services/api";

const requestApi = {
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

export default requestApi;
