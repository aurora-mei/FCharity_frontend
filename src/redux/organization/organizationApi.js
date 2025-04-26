import { data } from "react-router-dom";
import api from "../../services/api";

const organizationApi = {
  // -------------------- For Admin ---------------------
  getOrganizationsWaitingForCreation: () =>
    api.get("/organizations/admin-review/waiting-for-creation"),
  getOrganizationsWaitingForDeletion: () =>
    api.get("/organizations/admin-review/waiting-for-deletion"),
  // --------------------------------- Start Organization RestController ------------------------
  getCeoOrganization: (organizationId) =>
    api.get(`/organizations/${organizationId}/ceo`),
  getRecommendedOrganizations: () => api.get("/organizations/recommended"),
  getOrganizationsRanking: () => api.get("/organizations/ranking"),
  getAllOrganizations: () => api.get("/organizations"),
  getJoinedOrganizations: () => api.get(`/organizations/joined-organizations`),
  getOrganizationById: (organizationId) =>
    api.get(`/organizations/${organizationId}`),
  getManagedOrganizationByCeo: () => api.get("/organization/managedByCeo"),
  getManagedOrganizationsByManager: () =>
    api.get("/organizations/managedByManager"),

  createOrganization: (orgData) => api.post("/organizations", orgData),
  updateOrganization: (orgData) => api.put("/organizations", orgData),
  deleteOrganization: (organizationId) =>
    api.delete(`/organizations/${organizationId}`),

  // ----------------------------   End Organization RestController -------------------------------

  // ----------------------------   Start OrganizationMember RestController -------------------------------
  getAllMembers: (organizationId) => api.get(`/organization-members`),
  getAllMembersInOrganization: (organizationId) =>
    api.get(`/organization-members/${organizationId}`),
  addOrganizationMember: (organizationMemberData) =>
    api.post(
      `/organization-members/${organizationMemberData.organizationId}/${organizationMemberData.userId}`
    ),
  updateOrganizationMemberRole: (organizationMemberData) =>
    api.put(`/organization-members/update-role`, organizationMemberData),
  deleteOrganizationMember: (membershipId) =>
    api.delete(`/organization-members/${membershipId}`),

  // ----------------------------   End OrganizationMember RestController -------------------------------

  // ---------------------------  Start OrganizationRequest RestController ------------------------------
  getAllJoinInvitationRequests: () => api.get("/join-invitation-requests"),
  getAllJoinRequestsByOrganizationId: (organizationId) =>
    api.get(`/join-requests/organizations/${organizationId}`),
  getAllJoinRequestsByUserId: (userId) =>
    api.get(`/join-requests/users/${userId}`),
  getJoinRequestById: (joinRequestId) =>
    api.get(`/join-requests/${joinRequestId}`),
  createJoinRequest: (joinRequestData) =>
    api.post(
      `/join-requests/${joinRequestData.userId}/${joinRequestData.organizationId}`
    ),
  acceptJoinRequest: (joinRequestId) =>
    api.put(`/join-requests/${joinRequestId}/accept`),
  rejectJoinRequest: (joinRequestId) =>
    api.put(`/join-requests/${joinRequestId}/reject`),
  cancelJoinRequest: (joinRequestId) =>
    api.delete(`/join-requests/${joinRequestId}/cancel`),

  getAllInvitationRequestsByOrganizationId: (organizationId) =>
    api.get(`invitation-requests/organizations/${organizationId}`),
  getAllInvitationRequestsByUserId: (userId) =>
    api.get(`invitation-requests/users/${userId}`),
  getInvitationRequestById: (invitationRequestId) =>
    api.get(`/invitation-requests/${invitationRequestId}`),
  createInvitationRequest: (invitationRequestData) =>
    api.post(
      `/invitation-requests/${invitationRequestData.organizationId}/${invitationRequestData.userId}`
    ),

  acceptInvitationRequest: (invitationRequestId) =>
    api.put(`/invitation-requests/${invitationRequestId}/accept`),
  rejectInvitationRequest: (invitationRequestId) =>
    api.put(`/invitation-requests/${invitationRequestId}/reject`),
  cancelInvitationRequest: (invitationRequestId) =>
    api.delete(`/invitation-requests/${invitationRequestId}/cancel`),

  // ---------------------------  End OrganizationRequest RestController ------------------------------
  // ---------------------------  Start OrganizationFinance RestController ------------------------------
  getTotalIncome: (organizationId) =>
    api.get(`/finance/organizations/${organizationId}/totalIncome`),
  getTotalExpense: (organizationId) =>
    api.get(`/finance/organizations/${organizationId}/totalExpense`),
  getDonatesByOrganizationId: (organizationId) =>
    api.get(`/finance/organizations/${organizationId}/donates`),
  getTransactionsByOrganizationId: (organizationId) =>
    api.get(`/finance/organizations/${organizationId}/transactions`),

  createTransaction: (transactionData) =>
    api.post(`/finance/organizations/transactions`, transactionData),

  // ---------------------------  End OrganizationFinance RestController ------------------------------

  // ---------------------------  Start OrganizationEvent RestController ------------------------------
  getIncludesExcludes: (organizationEventId) =>
    api.get(`/events/${organizationEventId}/includes-excludes`),
  createIncludesExcludes: (includesExcludesData) =>
    api.post(`/events/includes-excludes`, includesExcludesData),
  updateIncludesExcludes: (includesExcludesData) =>
    api.put(`/events/includes-excludes`, includesExcludesData),
  deleteIncludesExcludes: (includesExcludesId) =>
    api.delete(`/events/${includesExcludesId}/includes-excludes`),

  getOrganizationEvents: (organizationId) =>
    api.get(`/events/organizations/${organizationId}`),
  addOrganizationEvent: (organizationEventData) =>
    api.post(
      `/events/${organizationEventData.organizerId}`,
      organizationEventData
    ),
  updateOrganizationEvent: (organizationEventData) =>
    api.put("/events", organizationEventData),
  deleteOrganizationEvent: (organizationEventId) =>
    api.delete(`/events/${organizationEventId}`),

  getOrganizationVerificationDocuments: (organizationId) =>
    api.get(`/files/organizations/${organizationId}`),

  addOrganizationVerificationDocument: (dataInfo) =>
    api.post(`/files/organizations`, dataInfo),
  deleteOrganizationVerificationDocument: (documentId) =>
    api.delete(`/files/organizations/${documentId}`),

  uploadFileLocal: async (dataInfo) => {
    const formData = new FormData();
    formData.append("file", dataInfo.file);
    try {
      return await api.post(
        `/files/organizations/${dataInfo.organizationId}/save`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteFileLocal: async (fileName) => {
    try {
      return await api.delete(`/files/${encodeURIComponent(fileName)}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getFileUrlLocal: (fileName) =>
    api.get(`/files/${encodeURIComponent(fileName)}`, { responseType: "blob" }),
  // ---------------------------  End OrganizationEvent RestController ----------------------------

  // ---------------------------  Start Organization Article RestController ------------------------------
  getAllArticles: () => api.get("/articles"),
  getArticleById: (articleId) => api.get(`/articles/${articleId}`),
  getArticleByOrganizationId: (organizationId) =>
    api.get(`/articles/organizations/${organizationId}`),
  createArticle: (articleData) => api.post("/articles", articleData),
  updateArticle: (articleData) => api.put("/articles", articleData),
  deleteArticle: (articleId) => api.delete(`/articles/${articleId}`),

  getAllArticleLikes: () => api.get("/articles/likes"),
  getArticleLikesByArticleId: (articleId) =>
    api.get(`/articles/likes/${articleId}`),
  likeArticle: (articleId, userId) =>
    api.post(`/articles/${articleId}/${userId}/like`),
  unlikeArticle: (articleId, userId) =>
    api.delete(`/articles/${articleId}/${userId}/unlike`),

  getAuthor: () => api.get("/articles/author"),
  // ---------------------------  End Organization Article RestController ------------------------------

  // ----------------- Start User ------------------------------

  getAllUsersNotInOrganization: (organizationId) =>
    api.get(
      `/organization-members/${organizationId}/users-not-in-organization`
    ),
};

export default organizationApi;
