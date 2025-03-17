import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import organizationApi from "./organizationApi.js";

const initialState = {
  organizations: [],
  currentOrganization: null,
  members: [],
  joinRequests: [],
  inviteRequests: [],
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

export const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {},
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
      });
  },
});

export default organizationSlice.reducer;
