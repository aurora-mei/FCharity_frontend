import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import organizationInviteApi from "./organizationInviteApi"; 

const initialState = {
    myOrgInvitations: [], // State for organization invitations
    loading: false,
    success: null,
    error: null,
};

// Thunk để lấy danh sách lời mời tham gia tổ chức của user
export const fetchMyOrgInvitationsThunk = createAsyncThunk(
    "organizationInvite/fetchMyOrgInvitations",
    async (userId, { rejectWithValue }) => {
        try {
            return await organizationInviteApi.fetchMyOrgInvitations(userId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Thunk để user chấp nhận lời mời tham gia tổ chức
export const acceptOrgInvitationThunk = createAsyncThunk(
    "organizationInvite/accept",
    async (invitationId, { rejectWithValue }) => {
        try {
            return await organizationInviteApi.acceptOrgInvitationRequest(invitationId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Thunk để user từ chối lời mời tham gia tổ chức
export const rejectOrgInvitationThunk = createAsyncThunk(
    "organizationInvite/reject",
    async (invitationId, { rejectWithValue }) => {
        try {
            return await organizationInviteApi.rejectOrgInvitationRequest(invitationId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const organizationInviteSlice = createSlice({
    name: "organizationInvite",
    initialState,
    reducers: {
        resetOrgInviteStatus: (state) => {
            state.loading = false;
            state.success = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH Organization Invitations
            .addCase(fetchMyOrgInvitationsThunk.pending, (state) => {
                state.loading = true;
                state.error = null; 
            })
            .addCase(fetchMyOrgInvitationsThunk.fulfilled, (state, action) => {
                state.loading = false;
                 state.myOrgInvitations = action.payload.filter(invite => invite.status === 'PENDING');
            })
            .addCase(fetchMyOrgInvitationsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error;
                state.myOrgInvitations = []; 
            })

            // ACCEPT Organization Invitation
            .addCase(acceptOrgInvitationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(acceptOrgInvitationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload; 

            })
            .addCase(acceptOrgInvitationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error;
            })

            // REJECT Organization Invitation
            .addCase(rejectOrgInvitationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(rejectOrgInvitationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload; 

            })
            .addCase(rejectOrgInvitationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error;
            });
    },
});

// Export actions and reducer
export const { resetOrgInviteStatus } = organizationInviteSlice.actions;
export default organizationInviteSlice.reducer;