import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import organizationInviteApi from "./inviteRequestOrganizationApi"; // Assuming Api file is named this way

const initialState = {
    myOrgInvitations: [],
    loading: false,
    success: null,
    error: null,
};

export const fetchMyOrgInvitationsThunk = createAsyncThunk(
    "inviteRequestOrganization/fetchMyOrgInvitations", // Updated slice name prefix
    async (userId, { rejectWithValue }) => {
        try {
            // Assuming API function is named fetchMyOrgInvitations
            return await organizationInviteApi.fetchMyOrgInvitations(userId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const acceptOrgInvitationThunk = createAsyncThunk(
    "inviteRequestOrganization/accept", // Updated slice name prefix
    async (invitationId, { rejectWithValue }) => {
        try {
            // Assuming API function is named acceptOrgInvitationRequest
            return await organizationInviteApi.acceptOrgInvitationRequest(invitationId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const rejectOrgInvitationThunk = createAsyncThunk(
    "inviteRequestOrganization/reject", // Updated slice name prefix
    async (invitationId, { rejectWithValue }) => {
        try {
             // Assuming API function is named rejectOrgInvitationRequest
            return await organizationInviteApi.rejectOrgInvitationRequest(invitationId);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const inviteRequestOrganizationSlice = createSlice({
    name: "inviteRequestOrganization", // Updated slice name
    initialState,
    reducers: {
        resetOrgInviteStatus: (state) => {
            // Keep loading true if it was already true from fetch pending? Decide based on UX needed.
            // state.loading = false; // Or maybe only reset on success/error?
            state.success = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyOrgInvitationsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrgInvitationsThunk.fulfilled, (state, action) => {
                state.loading = false;
                // Log the raw payload from API before filtering
                console.log("Raw Org Invitations Payload:", action.payload);
                // Filter for PENDING status - ensure 'PENDING' is the exact string used in your backend DTO/Entity
                state.myOrgInvitations = action.payload.filter(invite => invite.status?.trim().toUpperCase() === 'PENDING');
                console.log("Filtered Org Invitations (Pending only):", state.myOrgInvitations);
            })
            .addCase(fetchMyOrgInvitationsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error;
                state.myOrgInvitations = [];
            })

            .addCase(acceptOrgInvitationThunk.pending, (state) => {
                // Keep state.loading true or manage action-specific loading
                state.error = null;
                state.success = null;
            })
            .addCase(acceptOrgInvitationThunk.fulfilled, (state, action) => {
                state.success = action.payload;
                 // Decide if you want to set loading false here or wait for re-fetch
            })
            .addCase(acceptOrgInvitationThunk.rejected, (state, action) => {
                state.error = action.payload || action.error;
                 // Decide if you want to set loading false here
            })

            .addCase(rejectOrgInvitationThunk.pending, (state) => {
                 // Keep state.loading true or manage action-specific loading
                state.error = null;
                state.success = null;
            })
            .addCase(rejectOrgInvitationThunk.fulfilled, (state, action) => {
                state.success = action.payload;
                 // Decide if you want to set loading false here or wait for re-fetch
            })
            .addCase(rejectOrgInvitationThunk.rejected, (state, action) => {
                state.error = action.payload || action.error;
                 // Decide if you want to set loading false here
            });
    },
});

export const { resetOrgInviteStatus } = inviteRequestOrganizationSlice.actions;
export default inviteRequestOrganizationSlice.reducer; // Check export name matches import in store