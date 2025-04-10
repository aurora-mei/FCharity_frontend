import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import inviteRequestProjectApi from "./inviteRequestProjectApi";

const initialState = {
    myInvitations: [],
    loading: false,
    success: null,
    error: null,
};

export const fetchMyInvitationsThunk = createAsyncThunk(
    "inviteRequestProject/fetchMyInvitations",
    async (userId) => {
      return await inviteRequestProjectApi.fetchMyInvitations(userId);
    }
  );  

// Thunk duyệt lời mời
export const approveInviteThunk = createAsyncThunk(
    "inviteRequest/approve",
    async (requestId) => {
        return await inviteRequestProjectApi.approveInviteRequest(requestId);
    }
);

// Thunk từ chối lời mời
export const rejectInviteThunk = createAsyncThunk(
    "inviteRequest/reject",
    async (requestId) => {
        return await inviteRequestProjectApi.rejectInviteRequest(requestId);
    }
);

// Slice
const inviteRequestProjectSlice = createSlice({
    name: "inviteRequest",
    initialState,
    reducers: {
        resetInviteStatus: (state) => {
            state.loading = false;
            state.success = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(fetchMyInvitationsThunk.pending, (state) => {
                state.loading = true;
              })
              .addCase(fetchMyInvitationsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.myInvitations = action.payload;
              })
              .addCase(fetchMyInvitationsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error;
              })
            // APPROVE
            .addCase(approveInviteThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveInviteThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload;
            })
            .addCase(approveInviteThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })

            // REJECT
            .addCase(rejectInviteThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectInviteThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload;
            })
            .addCase(rejectInviteThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            });
    },
});

// Export
export const { resetInviteStatus } = inviteRequestProjectSlice.actions;
export default inviteRequestProjectSlice.reducer;