import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import requestApi from "./requestApi.js";

const initialState = {
  requests: [],
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
      });
  },
});

export default requestSlice.reducer;
