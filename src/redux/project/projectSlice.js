import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectApi from './projectApi';

const initialState = {
    loading: false,
    projects: [],
    currentProject:{},
    myOwnerProject:{},
    currentDonation:{},
    donations: [],
    myJoinedProject:[],
   projectMembers:[],
    projectRequests: [],
    error: null,
};
export const fetchProjectsThunk = createAsyncThunk("project/fetch", async () => {
    return await projectApi.fetchProjects();
});
export const fetchMyOwnerProject = createAsyncThunk("project/my-owner-project", async (userId) => {
    return await projectApi.fetchMyOwnerProject(userId);
});
export const fetchProjectById = createAsyncThunk("project/fetch-by-id", async (id) => {
    return await projectApi.fetchProjectById(id);
});
export const createProjectThunk = createAsyncThunk("project/create", async (projectData) => {
    return await projectApi.createProject(projectData);
});
//members
export const fetchProjectMembers = createAsyncThunk("project/members", async (projectId) => {
    return await projectApi.fetchProjectMembers(projectId);
});
export const addProjectMemberThunk = createAsyncThunk("project/members/add-member", async ({projectId,userId}) => {
    return await projectApi.addProjectMember({projectId,userId});
});
export const moveOutProjectMemberThunk = createAsyncThunk("project/members/move-out", async (memberId) => {
    return await projectApi.moveOutProjectMember(memberId);
});

//requests
export const fetchProjectRequests = createAsyncThunk("project/requests", async (projectId) => {
    return await projectApi.getAllProjectRequest(projectId);
});
export const sendJoinRequestThunk = createAsyncThunk("project/send-join-request", async ({projectId,requestData}) => {
    return await projectApi.sendJoinRequest({projectId, requestData});
});
//donations
export const createDonationThunk = createAsyncThunk("project/create-donation", async (donationData) => {
    return await projectApi.createDonation(donationData);
});
export const fetchDonationsOfProject = createAsyncThunk("project/get-donations", async (projectId) => {
    return await projectApi.getDonationsOfProject(projectId);
});
export const fetchProjectByWallet = createAsyncThunk("project/get-by-wallet", async (walletId) => {
    return await projectApi.getProjectByWallet(walletId);
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
            //members
            .addCase(fetchProjectMembers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.projectMembers = action.payload;
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
                state.projectMembers.push(action.payload);
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
                state.projectMembers = state.projectMembers.filter(member => member.id !== action.payload.id);
            })
            .addCase(moveOutProjectMemberThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            //requests
            .addCase(fetchProjectRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectRequests.fulfilled, (state, action) => {
                state.loading = false;
                console.log("Project requests:", action.payload);
                state.projectRequests = action.payload;
            })
            .addCase(fetchProjectRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(sendJoinRequestThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendJoinRequestThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.projectRequests = state.projectRequests.push(action.payload);
            })
            .addCase(sendJoinRequestThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            //donations
            .addCase(createDonationThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(createDonationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDonation = action.payload;
                state.donations.push(action.payload);
            })
            .addCase(createDonationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchDonationsOfProject.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDonationsOfProject.fulfilled, (state, action) => {
                state.loading = false;
                state.donations = action.payload;
            })
            .addCase(fetchDonationsOfProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            ;
        
    },
});

export default projectSlice.reducer;