import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import organizationApi from "./organizationApi.js";
import userApi from "../user/userApi.js";
import { useSelector } from "react-redux";

const initialState = {
  organizationsWaitingForCreation: [],
  organizationsWaitingForDeletion: [],
  joinInvitationRequests: [],

  currentOrganization: null,
  currentOrganizationMembers: [],
  usersOutsideOrganization: [],

  invitations: [],
  currentInvitation: null,

  joinRequests: [],
  currentJoinRequest: null,

  membersInAllOrganizations: [],

  recommendedOrganizations: [],
  organizations: [], // for guest, member, manager, ceo, admin
  selectedOrganization: 0,

  joinedOrganizations: [],
  selectedOrganizationByMember: 0, // for member

  managedOrganizations: [], // for manager
  selectedOrganizationByManager: 0,

  orgCeo: null,
  ownedOrganization: null, // for ceo only one organization
  organizationEvents: [],
  verificationDocuments: [],

  articles: [],
  articleLikes: [],
  author: null,

  currentArticle: null,
  currentArticleLikes: [],
  organizationArticles: [],

  organizationsRanking: [],

  allJoinInvitationRequests: [],
  loading: false,
  error: null,
};

// ------------------ Organization -------------------

export const getOrganizationsWaitingForCreation = createAsyncThunk(
  "organizations/getWaitingForCreation",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await organizationApi.getOrganizationsWaitingForCreation();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const getOrganizationsWaitingForDeletion = createAsyncThunk(
  "organizations/getWaitingForDeletion",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await organizationApi.getOrganizationsWaitingForDeletion();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const getRecommendedOrganizations = createAsyncThunk(
  "organizations/getRecommended",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getRecommendedOrganizations();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const getOrganizationsRanking = createAsyncThunk(
  "organizations/getRanking",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getOrganizationsRanking();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const getCeoOrganization = createAsyncThunk(
  "organizations/getCeoOrganization",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getCeoOrganization(organizationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const getAllOrganizations = createAsyncThunk(
  "organizations/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getAllOrganizations();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const getJoinedOrganizations = createAsyncThunk(
  "organizations/getJoinedOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getJoinedOrganizations();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const getOrganizationById = createAsyncThunk(
  "organizations/getById",
  async (organizationId, { rejectWithValue }) => {
    try {
      if (!organizationId) {
        return null;
      }
      const response = await organizationApi.getOrganizationById(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organization"
      );
    }
  }
);

export const getManagedOrganizationByCeo = createAsyncThunk(
  "organizations/getManagedByCeo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getManagedOrganizationByCeo();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const getManagedOrganizationsByManager = createAsyncThunk(
  "organizations/getManagedByManager",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getManagedOrganizationsByManager();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organizations"
      );
    }
  }
);

export const createOrganization = createAsyncThunk(
  "organizations/create",
  async (orgData, { rejectWithValue }) => {
    try {
      console.log("createOrganization: 🕷️🕷️ ", orgData);
      const response = await organizationApi.createOrganization(orgData);
      console.log("createOrganization: 🕷️🕷️🍎 ", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating organization"
      );
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organizations/update",
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.updateOrganization(orgData);
      console.log("updateOrganization: 🕷️🕷️🍎 ", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating organization"
      );
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  "organizations/delete",
  async (organizationId, { rejectWithValue }) => {
    try {
      await organizationApi.deleteOrganization(organizationId);
      return organizationId; // Trả về ID để xóa trong state
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error deleting organization"
      );
    }
  }
);

// ---------------------- Organization Members -------------------

export const getOrganizationMembers = createAsyncThunk(
  "organizations/getOrganizationMembers",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getOrganizationMembers(
        organizationId
      );
      console.log("members: ", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organization members"
      );
    }
  }
);

export const getAllMembersInOrganization = createAsyncThunk(
  "organizations/getAllMembersInOrganization",
  async (organizationId, { rejectWithValue }) => {
    try {
      if (!organizationId) {
        return [];
      }
      const response = await organizationApi.getAllMembersInOrganization(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching all members"
      );
    }
  }
);

export const addOrganizationMember = createAsyncThunk(
  "organizations/addMember",
  async (organizationMemberData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.addOrganizationMember(
        organizationMemberData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error adding organization member"
      );
    }
  }
);

export const updateOrganizationMemberRole = createAsyncThunk(
  "organizations/updateMember",
  async (organizationMemberData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.updateOrganizationMemberRole(
        organizationMemberData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating organization member"
      );
    }
  }
);

export const deleteOrganizationMember = createAsyncThunk(
  "organizations/deleteMember",
  async (membershipId, { rejectWithValue }) => {
    try {
      await organizationApi.deleteOrganizationMember(membershipId);
      return membershipId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error deleting organization member"
      );
    }
  }
);

// ---------------------- Organization Requests -------------------
export const getAllJoinInvitationRequests = createAsyncThunk(
  "organizations/getAllJoinInvitationRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getAllJoinInvitationRequests();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching join invitation requests"
      );
    }
  }
);

export const getAllJoinRequestsByOrganizationId = createAsyncThunk(
  "organizations/getAllJoinRequestsByOrganizationId",
  async (organizationId, { rejectWithValue }) => {
    try {
      if (!organizationId) {
        return null;
      }
      const response = await organizationApi.getAllJoinRequestsByOrganizationId(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching join requests"
      );
    }
  }
);

export const getAllJoinRequestsByUserId = createAsyncThunk(
  "organizations/getAllJoinRequestsByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getAllJoinRequestsByUserId(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching join requests"
      );
    }
  }
);

export const getJoinRequestById = createAsyncThunk(
  "organizations/getJoinRequestById",
  async (joinRequestId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getJoinRequestById(joinRequestId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching join request"
      );
    }
  }
);

export const createJoinRequest = createAsyncThunk(
  "organizations/createJoinRequest",
  async (joinRequestData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.createJoinRequest(joinRequestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating join request"
      );
    }
  }
);

export const acceptJoinRequest = createAsyncThunk(
  "organizations/acceptJoinRequest",
  async (joinRequestId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.acceptJoinRequest(joinRequestId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error accepting join request"
      );
    }
  }
);

export const rejectJoinRequest = createAsyncThunk(
  "organizations/rejectJoinRequest",
  async (joinRequestId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.rejectJoinRequest(joinRequestId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error rejecting join request"
      );
    }
  }
);

export const cancelJoinRequest = createAsyncThunk(
  "organizations/cancelJoinRequest",
  async (joinRequestId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.cancelJoinRequest(joinRequestId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error canceling join request"
      );
    }
  }
);

export const getAllInvitationRequestsByOrganizationId = createAsyncThunk(
  "organizations/getAllInvitationRequestsByOrganizationId",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response =
        await organizationApi.getAllInvitationRequestsByOrganizationId(
          organizationId
        );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching invitation requests"
      );
    }
  }
);

export const getAllInvitationRequestsByUserId = createAsyncThunk(
  "organizations/getAllInvitationRequestsByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getAllInvitationRequestsByUserId(
        userId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching invitation requests"
      );
    }
  }
);

export const getInvitationRequestById = createAsyncThunk(
  "organizations/getInvitationRequestById",
  async (invitationRequestId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getInvitationRequestById(
        invitationRequestId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching invitation request"
      );
    }
  }
);

export const createInvitationRequest = createAsyncThunk(
  "organizations/createInvitationRequest",
  async (invitationRequestData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.createInvitationRequest(
        invitationRequestData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating invitation request"
      );
    }
  }
);

export const acceptInvitationRequest = createAsyncThunk(
  "organizations/acceptInvitationRequest",
  async (invitationRequestId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.acceptInvitationRequest(
        invitationRequestId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error accepting invitation request"
      );
    }
  }
);

export const rejectInvitationRequest = createAsyncThunk(
  "organizations/rejectInvitationRequest",
  async (invitationRequestId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.rejectInvitationRequest(
        invitationRequestId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error rejecting invitation request"
      );
    }
  }
);

export const cancelInvitationRequest = createAsyncThunk(
  "organizations/cancelInvitationRequest",
  async (invitationRequestId, { rejectWithValue }) => {
    try {
      await organizationApi.cancelInvitationRequest(invitationRequestId);
      return invitationRequestId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error canceling invitation request"
      );
    }
  }
);

// ------------------------ Organization Events -----------------
export const getOrganizationEvents = createAsyncThunk(
  "events/getAllInOrganization",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getOrganizationEvents(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error getOrganizationEvents"
      );
    }
  }
);

export const addOrganizationEvent = createAsyncThunk(
  "events/addOrganizationEvent",
  async (organizationEventData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.addOrganizationEvent(
        organizationEventData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error addOrganizationEvent"
      );
    }
  }
);

export const updateOrganizationEvent = createAsyncThunk(
  "events/updateOrganizationEvent",
  async (organizationEventData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.updateOrganizationEvent(
        organizationEventData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updateOrganizationEvent"
      );
    }
  }
);

export const deleteOrganizationEvent = createAsyncThunk(
  "events/deleteOrganizationEvent",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.deleteOrganizationEvent(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error deleteOrganizationEvent"
      );
    }
  }
);

export const getOrganizationVerificationDocuments = createAsyncThunk(
  "organizations/getOrganizationVerificationDocuments",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response =
        await organizationApi.getOrganizationVerificationDocuments(
          organizationId
        );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error getOrganizationVerificationDocuments"
      );
    }
  }
);

export const addOrganizationVerificationDocument = createAsyncThunk(
  "organizations/addOrganizationVerificationDocument",
  async (dataInfo, { rejectWithValue }) => {
    try {
      const response =
        await organizationApi.addOrganizationVerificationDocument(dataInfo);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error addOrganizationVerificationDocument"
      );
    }
  }
);

export const deleteOrganizationVerificationDocument = createAsyncThunk(
  "organizations/deleteOrganizationVerificationDocument",
  async (documentId, { rejectWithValue }) => {
    try {
      const response =
        await organizationApi.deleteOrganizationVerificationDocument(
          documentId
        );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error deleteOrganizationVerificationDocument"
      );
    }
  }
);

export const uploadFileLocal = createAsyncThunk(
  "organizations/uploadFileLocal",
  async (dataInfo, { rejectWithValue }) => {
    try {
      const response = await organizationApi.uploadFileLocal(dataInfo);
      console.log("file saved response: ", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error uploading file");
    }
  }
);

export const deleteFileLocal = createAsyncThunk(
  "organizations/deleteFileLocal",
  async (fileName, { rejectWithValue }) => {
    try {
      const response = await organizationApi.deleteFileLocal(fileName);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting file");
    }
  }
);

export const getFileUrlLocal = createAsyncThunk(
  "organizations/getFileUrlLocal",
  async (fileName, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getFileUrlLocal(fileName, {
        responseType: "blob",
      });
      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      return fileUrl;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error getting file url");
    }
  }
);

// ----------------------- End Organization Events --------------

// ----------------------- Start Organization Article --------------
export const getAllArticles = createAsyncThunk(
  "organizations/getAllArticles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getAllArticles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error getting articles");
    }
  }
);

export const getArticleById = createAsyncThunk(
  "organizations/getArticleById",
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getArticleById(articleId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error getting article");
    }
  }
);

export const getArticleByOrganizationId = createAsyncThunk(
  "organizations/getArticleByOrganizationId",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getArticleByOrganizationId(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error getting article by organization"
      );
    }
  }
);

export const createArticle = createAsyncThunk(
  "organizations/createArticle",
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.createArticle(articleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating article");
    }
  }
);

export const updateArticle = createAsyncThunk(
  "organizations/updateArticle",
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.updateArticle(articleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating article");
    }
  }
);

export const deleteArticle = createAsyncThunk(
  "organizations/deleteArticle",
  async (articleId, { rejectWithValue }) => {
    try {
      await organizationApi.deleteArticle(articleId);
      return articleId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting article");
    }
  }
);

export const getAllArticleLikes = createAsyncThunk(
  "organizations/getAllArticleLikes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getAllArticleLikes();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error getting article likes"
      );
    }
  }
);

export const getArticleLikesByArticleId = createAsyncThunk(
  "organizations/getArticleLikesByArticleId",
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getArticleLikesByArticleId(
        articleId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error getting article likes by article id"
      );
    }
  }
);

export const likeArticle = createAsyncThunk(
  "organizations/likeArticle",
  async (infoData, { rejectWithValue }) => {
    try {
      await organizationApi.likeArticle(infoData.articleId, infoData.userId);
      return infoData;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error liking article");
    }
  }
);

export const unlikeArticle = createAsyncThunk(
  "organizations/unlikeArticle",
  async (infoData, { rejectWithValue }) => {
    try {
      await organizationApi.unlikeArticle(infoData.articleId, infoData.userId);
      return infoData;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error unliking article");
    }
  }
);

export const getAuthor = createAsyncThunk(
  "organizations/getAuthor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getAuthor();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error getting author");
    }
  }
);

// ----------------------- End Organization Article --------------

export const getAllUsersNotInOrganization = createAsyncThunk(
  "organizations/getAllUsersNotInOrganization",
  async (organizationId, { rejectWithValue }) => {
    try {
      if (!organizationId) {
        const response = await userApi.getAllUsers();
        return response.data;
      } else {
        const response = await organizationApi.getAllUsersNotInOrganization(
          organizationId
        );
        console.log("🍎🍎🍎 users not in org: ", response.data);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching users not in organization"
      );
    }
  }
);

export const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrganizationsWaitingForCreation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOrganizationsWaitingForCreation.fulfilled,
        (state, action) => {
          state.loading = false;
          state.organizationsWaitingForCreation = action.payload;
        }
      )
      .addCase(getOrganizationsWaitingForCreation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrganizationsWaitingForDeletion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOrganizationsWaitingForDeletion.fulfilled,
        (state, action) => {
          state.loading = false;
          state.organizationsWaitingForDeletion = action.payload;
        }
      )
      .addCase(getOrganizationsWaitingForDeletion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getRecommendedOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecommendedOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedOrganizations = action.payload;
      })
      .addCase(getRecommendedOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrganizationsRanking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationsRanking.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationsRanking = action.payload;
      })
      .addCase(getOrganizationsRanking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getCeoOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCeoOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.orgCeo = action.payload;
      })
      .addCase(getCeoOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(getAllOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getJoinedOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJoinedOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.joinedOrganizations = action.payload;
      })
      .addCase(getJoinedOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrganizationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(getOrganizationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getManagedOrganizationByCeo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getManagedOrganizationByCeo.fulfilled, (state, action) => {
        state.loading = false;
        state.ownedOrganization = action.payload;
        state.currentOrganization = action.payload;
      })
      .addCase(getManagedOrganizationByCeo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getManagedOrganizationsByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getManagedOrganizationsByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.managedOrganizations = action.payload;
      })
      .addCase(getManagedOrganizationsByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.ownedOrganization = action.payload;
        state.organizations.push(action.payload);
        state.currentOrganization = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        console.log("updateOrganization: 🕷️🕷️ ", action.payload);
        state.loading = false;
        state.currentOrganization = action.payload;

        let index = state.organizations.findIndex(
          (org) => org.id === action.payload.id
        );
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }

        index = state.joinedOrganizations.findIndex(
          (org) => org.id === action.payload.id
        );
        if (index !== -1) {
          state.joinedOrganizations[index] = action.payload;
        }

        index = state.managedOrganizations.findIndex(
          (org) => org.id === action.payload.id
        );
        if (index !== -1) {
          state.managedOrganizations[index] = action.payload;
        }

        if (state.ownedOrganization.id === action.payload.id) {
          state.ownedOrganization = action.payload;
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.filter(
          (org) => org.id !== action.payload
        );
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrganizationMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.membersInAllOrganizations = action.payload;
      })
      .addCase(getOrganizationMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllMembersInOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMembersInOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganizationMembers = action.payload;
      })
      .addCase(getAllMembersInOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addOrganizationMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrganizationMember.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganizationMembers.push(action.payload);
        state.membersInAllOrganizations.push(action.payload);
      })
      .addCase(addOrganizationMember.rejected, (state) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateOrganizationMemberRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganizationMemberRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.currentOrganizationMembers.findIndex(
          (member) => member.membershipId === action.payload.membershipId
        );
        if (index !== -1) {
          state.currentOrganizationMembers[index] = action.payload;
        }

        const indexAll = state.membersInAllOrganizations.findIndex(
          (member) => member.membershipId === action.payload.membershipId
        );
        if (indexAll !== -1) {
          state.membersInAllOrganizations[indexAll] = action.payload;
        }
      })
      .addCase(updateOrganizationMemberRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteOrganizationMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganizationMember.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganizationMembers =
          state.currentOrganizationMembers.filter(
            (member) => member.membershipId !== action.payload
          );
        state.membersInAllOrganizations =
          state.membersInAllOrganizations.filter(
            (member) => member.membershipId !== action.payload
          );
      })
      .addCase(deleteOrganizationMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllJoinInvitationRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllJoinInvitationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.joinInvitationRequests = action.payload;
      })
      .addCase(getAllJoinInvitationRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllJoinRequestsByOrganizationId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllJoinRequestsByOrganizationId.fulfilled,
        (state, action) => {
          state.loading = false;
          state.joinRequests = action.payload;
        }
      )
      .addCase(getAllJoinRequestsByOrganizationId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllJoinRequestsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllJoinRequestsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.joinRequests = action.payload;
      })
      .addCase(getAllJoinRequestsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getJoinRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJoinRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJoinRequest = action.payload;
      })
      .addCase(getJoinRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createJoinRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJoinRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.joinRequests.push(action.payload);
        state.currentJoinRequest = action.payload;
      })
      .addCase(createJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(acceptJoinRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptJoinRequest.fulfilled, (state, action) => {
        state.loading = false;

        state.joinRequests = state.joinRequests.map((request) =>
          request.organizationRequestId !== action.payload.organizationRequestId
            ? request
            : action.payload
        );
      })
      .addCase(acceptJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(rejectJoinRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectJoinRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.joinRequests = state.joinRequests.map((request) =>
          request.organizationRequestId !== action.payload.organizationRequestId
            ? request
            : action.payload
        );
      })
      .addCase(rejectJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(cancelJoinRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelJoinRequest.fulfilled, (state, action) => {
        state.loading = false;
        const joinRequestId = action.payload;
        state.joinRequests = state.joinRequests.filter(
          (request) => request.id !== joinRequestId
        );
      })
      .addCase(cancelJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllInvitationRequestsByOrganizationId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllInvitationRequestsByOrganizationId.fulfilled,
        (state, action) => {
          state.loading = false;
          state.invitations = action.payload;
        }
      )
      .addCase(
        getAllInvitationRequestsByOrganizationId.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(getAllInvitationRequestsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInvitationRequestsByUserId.fulfilled, (state) => {
        state.loading = false;
        state.invitations = action.payload;
      })
      .addCase(getAllInvitationRequestsByUserId.rejected, (state) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getInvitationRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvitationRequestById.fulfilled, (state) => {
        state.loading = false;
        state.currentInvitation = action.payload;
      })
      .addCase(getInvitationRequestById.rejected, (state) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createInvitationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvitationRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.invitations.push(action.payload);
        state.currentInvitation = action.payload;
      })
      .addCase(createInvitationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(acceptInvitationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptInvitationRequest.fulfilled, (state) => {
        state.loading = false;
        const invitationRequestId = action.payload;
        state.invitations = state.invitations.map((request) =>
          request.id !== invitationRequestId
            ? request
            : { ...request, status: "Accepted" }
        );
      })
      .addCase(acceptInvitationRequest.rejected, (state) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(rejectInvitationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectInvitationRequest.fulfilled, (state) => {
        state.loading = false;
        const invitationRequestId = action.payload;
        state.invitations = state.invitations.map((request) =>
          request.id !== invitationRequestId
            ? request
            : { ...request, status: "Rejected" }
        );
      })
      .addCase(rejectInvitationRequest.rejected, (state) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(cancelInvitationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelInvitationRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.invitations = state.invitations.filter(
          (request) => request.organizationRequestId !== action.payload
        );
      })
      .addCase(cancelInvitationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllUsersNotInOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsersNotInOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.usersOutsideOrganization = action.payload;
      })
      .addCase(getAllUsersNotInOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrganizationEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationEvents = action.payload;
      })
      .addCase(getOrganizationEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addOrganizationEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrganizationEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationEvents.push(action.payload);
      })
      .addCase(addOrganizationEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrganizationEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganizationEvent.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateOrganizationEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrganizationEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganizationEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationEvents = state.organizationEvents.filter(
          (organizationEvent) =>
            organizationEvent.organizationEventId !==
            action.payload.organizationEventId
        );
      })
      .addCase(deleteOrganizationEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrganizationVerificationDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOrganizationVerificationDocuments.fulfilled,
        (state, action) => {
          state.loading = false;
          state.verificationDocuments = action.payload;
        }
      )
      .addCase(
        getOrganizationVerificationDocuments.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(uploadFileLocal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFileLocal.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(uploadFileLocal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ---------------------------------------------------------------------------
      .addCase(getAllArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(getAllArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getArticleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticle = action.payload;
      })
      .addCase(getArticleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getArticleByOrganizationId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticleByOrganizationId.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationArticles = action.payload;
      })
      .addCase(getArticleByOrganizationId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationArticles.push(action.payload);
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationArticles = state.organizationArticles.map(
          (article) => {
            if (article.articleId === action.payload.articleId) {
              return action.payload;
            }
            return article;
          }
        );
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.organizationArticles = state.organizationArticles.filter(
          (article) => article.articleId !== action.payload
        );
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllArticleLikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllArticleLikes.fulfilled, (state, action) => {
        state.loading = false;
        state.articleLikes = action.payload;
      })
      .addCase(getAllArticleLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getArticleLikesByArticleId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticleLikesByArticleId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticleLikes = action.payload;
      })
      .addCase(getArticleLikesByArticleId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(likeArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likeArticle.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(likeArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(unlikeArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlikeArticle.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(unlikeArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.author = action.payload;
      })
      .addCase(getAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedOrganization, setCurrentOrganization } =
  organizationSlice.actions;
export default organizationSlice.reducer;
