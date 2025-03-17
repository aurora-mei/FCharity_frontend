import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import requestApi from "./requestApi.js";

const initialState = {
  requests: [],
  joinRequests: [],
  inviteRequests: [],
  currentJoinRequest: null,
  reports: [],
  loading: false,
  error: null,
};

// Async Thunks
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

// Slice
const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllRequests
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
      });
  },
});

export default requestSlice.reducer;
