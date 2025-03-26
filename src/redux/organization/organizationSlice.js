import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import organizationApi from "./organizationApi.js";

const initialState = {
  organizations: [],
  managedOrganizations: [],
  selectedOrganization: null,
  requests: [],
  currentOrganization: null,
  members: [],
  joinRequests: [],
  inviteRequests: [],
  currentJoinRequest: null,
  reports: [],
  loading: false,
  error: null,
};

// Async Thunks
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

export const createOrganization = createAsyncThunk(
  "organizations/create",
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await organizationApi.createOrganization(orgData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating organization"
      );
    }
  }
);

export const getOrganization = createAsyncThunk(
  "organizations/getOne",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getOrganization(organizationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organization"
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

export const getOrganizationMembers = createAsyncThunk(
  "organizations/getMembers",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getOrganizationMembers(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching organization members"
      );
    }
  }
);

export const removeOrganizationMember = createAsyncThunk(
  "organizations/removeMember",
  async (membershipId, { rejectWithValue }) => {
    try {
      await organizationApi.removeOrganizationMember(membershipId);
      return membershipId; // Trả về ID để xóa trong state
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error removing organization member"
      );
    }
  }
);

export const getOrganizationJoinRequests = createAsyncThunk(
  "organizations/getJoinRequests",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getJoinRequestsByOrganizationId(
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

export const getOrganizationInviteRequests = createAsyncThunk(
  "organizations/getInviteRequests",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getOrganizationInviteRequests(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching invite requests"
      );
    }
  }
);

export const createMemberInviteRequest = createAsyncThunk(
  "organizations/createMemberInviteRequest",
  async (requestInfo, { rejectWithValue }) => {
    try {
      const response = await organizationApi.inviteMember(requestInfo);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating organization"
      );
    }
  }
);

export const getManagedOrganizations = createAsyncThunk(
  "auth/getManagedOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.getManagedOrganizations();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch managed organizations"
      );
    }
  }
);

// Organization Requests

export const getAllJoinRequestByOrganizationId = createAsyncThunk(
  "requests/getAllJoinRequestByOrganizationId",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await requestApi.getAllJoinRequestByOrganizationId(
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

export const getJoinRequestById = createAsyncThunk(
  "requests/getJoinRequestById",
  async (joinRequestId, { rejectWithValue }) => {
    try {
      const response = await requestApi.getJoinRequestById(joinRequestId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching join request"
      );
    }
  }
);

export const getJoinRequestByUserId = createAsyncThunk(
  "requests/getJoinRequestByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await requestApi.getJoinRequestByUserId(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching join request"
      );
    }
  }
);

export const createJoinRequest = createAsyncThunk(
  "requests/createJoinRequest",
  async (joinRequestData, { rejectWithValue }) => {
    try {
      const response = await requestApi.createJoinRequest(joinRequestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating join request"
      );
    }
  }
);

export const updateJoinRequest = createAsyncThunk(
  "requests/updateJoinRequest",
  async (joinRequestData, { rejectWithValue }) => {
    try {
      const response = await requestApi.updateJoinRequest(joinRequestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating join request"
      );
    }
  }
);

export const deleteJoinRequest = createAsyncThunk(
  "requests/deleteJoinRequest",
  async (joinRequestId, { rejectWithValue }) => {
    try {
      await requestApi.deleteJoinRequest(joinRequestId);
      return joinRequestId; // Trả về ID để xóa trong state
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error deleting join request"
      );
    }
  }
);

export const getAllRequests = createAsyncThunk(
  "requests/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestApi.getAllRequests();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching requests");
    }
  }
);

export const getAllRequestsByOrganization = createAsyncThunk(
  "requests/getAllByOrg",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await requestApi.getAllRequestsByOrganization(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching requests by org"
      );
    }
  }
);

export const getAllReports = createAsyncThunk(
  "requests/getAllReports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestApi.getAllReports();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching reports");
    }
  }
);

export const getAllReportsByOrganization = createAsyncThunk(
  "requests/getAllReportsByOrg",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await requestApi.getAllReportsByOrganization(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching reports by org"
      );
    }
  }
);

export const donate = createAsyncThunk(
  "requests/donate",
  async (donationData, { rejectWithValue }) => {
    try {
      const response = await requestApi.donate(donationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error donating");
    }
  }
);

export const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations.push(action.payload);
      })
      .addCase(getOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.filter(
          (org) => org.id !== action.payload
        );
      })
      .addCase(getOrganizationMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(getOrganizationMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrganizationMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeOrganizationMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter(
          (member) => member.membershipId !== action.payload
        );
      })
      .addCase(removeOrganizationMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeOrganizationMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationInviteRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.inviteRequests = action.payload;
      })
      .addCase(getOrganizationInviteRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrganizationInviteRequests.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(getAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getAllRequestsByOrganization
      .addCase(getAllRequestsByOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      // getAllReports
      .addCase(getAllReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      // getAllReportsByOrganization
      .addCase(getAllReportsByOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      // donate
      .addCase(donate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(donate.fulfilled, (state, action) => {
        state.loading = false;
        // Có thể thêm logic nếu cần, ví dụ: cập nhật danh sách requests/reports
      })
      .addCase(donate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllJoinRequestByOrganizationId.fulfilled, (state, action) => {
        state.loading = false;
        state.joinRequests = action.payload;
      })
      .addCase(getAllJoinRequestByOrganizationId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllJoinRequestByOrganizationId.pending, (state) => {
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
      .addCase(getJoinRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJoinRequestByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.joinRequests = action.payload;
      })
      .addCase(getJoinRequestByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getJoinRequestByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJoinRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.joinRequests.push(action.payload);
      })
      .addCase(createJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createJoinRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJoinRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJoinRequest = action.payload;
      })
      .addCase(updateJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateJoinRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJoinRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.joinRequests = state.joinRequests.filter(
          (joinRequest) => joinRequest !== action.payload.joinRequestId
        );
      })
      .addCase(deleteJoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteJoinRequest.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getManagedOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getManagedOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.managedOrganizations = action.payload;
      })
      .addCase(getManagedOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;
