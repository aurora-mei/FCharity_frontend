import axios from "axios";
import { APIPrivate } from "../../config/API/api";
import api from "../../services/api";

const organizationApi = {
  // -------------------- For Admin ---------------------
  getOrganizationsWaitingForCreation: () =>
    api.get("/organizations/admin-review/waiting-for-creation"),
  getOrganizationsWaitingForDeletion: () =>
    api.get("/organizations/admin-review/waiting-for-deletion"),
  // --------------------------------- Start Organization RestController ------------------------
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
  updateOrganizationMember: (organizationMemberData) =>
    api.put(`/organization-members`, organizationMemberData),
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
    api.post("/join-requests", joinRequestData),
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

  // ---------------------------  Start OrganizationEvent RestController ------------------------------
  getOrganizationEvents: (organizationId) =>
    api.get(`/events/organizations/${organizationId}`),
  addOrganizationEvent: (organizationEventData) =>
    api.post("/events", organizationEventData),
  updateOrganizationEvent: (organizationEventData) =>
    api.put("/events", organizationEventData),
  deleteOrganizationEvent: (organizationEventId) =>
    api.delete(`/events/${organizationEventId}`),

  getOrganizationVerificationDocuments: (organizationId) =>
    api.get(`/organizations/${organizationId}/verification-documents`),
  createVerificationDocuments: (organizationId, docUrls) =>
    api.post(
      `/organizations/${organizationId}/verification-documents`,
      docUrls
    ),

  uploadFileLocal: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = axios.post("/api/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("upload file response: 🍎🍎🍎 ", response);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // ---------------------------  End OrganizationEvent RestController ----------------------------
  // ----------------- User ------------------------------

  getAllUsersNotInOrganization: (organizationId) =>
    api.get(
      `/organization-members/${organizationId}/users-not-in-organization`
    ),
};

export default organizationApi;
