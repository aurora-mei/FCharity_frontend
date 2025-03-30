import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectApi from './projectApi';

const initialState = {
    loading: false,
    projects: [],
    currentProject:{},
    myOwnerProject:{},
    myJoinedProject:[],
    myProjectMembers:[],
    error: null,
};

export const fetchMyOwnerProject = createAsyncThunk("project/my-owner-project", async (userId) => {
    return await projectApi.fetchMyOwnerProject(userId);
});

export const createProjectThunk = createAsyncThunk("project/create", async (projectData) => {
    return await projectApi.createProject(projectData);
});
export const fetchProjectMembers = createAsyncThunk("project/members", async (projectId) => {
    return await projectApi.fetchProjectMembers(projectId);
});
const projectSlice = createSlice({
    name: 'Project',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createProjectThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProjectThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProject = action.payload;
            })
            .addCase(createProjectThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchMyOwnerProject.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyOwnerProject.fulfilled, (state, action) => {
                state.loading = false;
                state.myOwnerProject = action.payload;
            })
            .addCase(fetchMyOwnerProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchProjectMembers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.myProjectMembers = action.payload;
            })
            .addCase(fetchProjectMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            ;
        
    },
});

export default projectSlice.reducer;