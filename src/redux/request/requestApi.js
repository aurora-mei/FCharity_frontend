import api from "../../services/api";

const requestApi = {
  getAllRequests: () => api.get("/requests"),
  getAllRequestsByOrganization: (organizationId) =>
    api.get(`/requests?organization_id=${organizationId}`),
  getAllReports: () => api.get("/reports"),
  getAllReportsByOrganization: (organizationId) =>
    api.get(`/reports?organization_id=${organizationId}`),
  donate: (donationData) => api.post("/donate", donationData),
};

export default requestApi;
