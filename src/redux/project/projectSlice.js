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
export const fetchProjectsThunk = createAsyncThunk("project/fetch", async () => {
    return await projectApi.fetchProjects();
});
export const fetchMyOwnerProject = createAsyncThunk("project/my-owner-project", async (userId) => {
    return await projectApi.fetchMyOwnerProject(userId);
});

export const createProjectThunk = createAsyncThunk("project/create", async (projectData) => {
    return await projectApi.createProject(projectData);
});
export const fetchProjectMembers = createAsyncThunk("project/members", async (projectId) => {
    return await projectApi.fetchProjectMembers(projectId);
});
export const addProjectMemberThunk = createAsyncThunk("project/members/add-member", async ({projectId,userId}) => {
    return await projectApi.addProjectMember({projectId,userId});
});
export const moveOutProjectMemberThunk = createAsyncThunk("project/members/move-out", async (memberId) => {
    return await projectApi.moveOutProjectMember(memberId);
});
export const fetchProjectById = createAsyncThunk("project/fetch-by-id", async (id) => {
    return await projectApi.fetchProjectById(id);
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
            .addCase(fetchProjectsThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjectsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchProjectById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProject = action.payload;
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
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
            .addCase(addProjectMemberThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(addProjectMemberThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.myProjectMembers.push(action.payload);
            })
            .addCase(addProjectMemberThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(moveOutProjectMemberThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(moveOutProjectMemberThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.myProjectMembers = state.myProjectMembers.filter(member => member.id !== action.payload.id);
            })
            .addCase(moveOutProjectMemberThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            ;
        
    },
});

export default projectSlice.reducer;