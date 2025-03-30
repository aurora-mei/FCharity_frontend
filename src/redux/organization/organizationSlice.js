import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import organizationApi from './organizationApi';

const initialState = {
    loading: false,
    organizations: [],
    currentOrganization :{},
    myOrganization:{},
    myOrganizationMembers:[],
    error: null,
};

export const fetchMyOrganization = createAsyncThunk("organization/my-org", async (userId) => {
    return await organizationApi.getMyOrganization(userId);
});

export const fetchOrganizationMembers = createAsyncThunk("organization/members", async (organizationId) => {
    return await organizationApi.getOrganizationMembers(organizationId);
});
const organizationSlice = createSlice({
    name: 'Organization',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyOrganization.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyOrganization.fulfilled, (state, action) => {
                state.loading = false;
                state.myOrganization = action.payload;
                localStorage.setItem("myOrganization", JSON.stringify(action.payload));
            })
            .addCase(fetchMyOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchOrganizationMembers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrganizationMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.myOrganizationMembers = action.payload;
            })
            .addCase(fetchOrganizationMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            });
        
    },
});

export default organizationSlice.reducer;