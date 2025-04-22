import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import projectApi from './projectApi';

const initialState = {
    loading: false,
    projects: [],
    currentProject: {},
    currentDonation: {},
    donations: [],
    myProjects: [],
    projectMembers: [],
    allProjectMembers: [],
    currentSpendingPlan: {},
    currentSpendingItem: {},
    spendingDetails: [],
    currentSpendingDetail:{},
    spendingItems: [],
    userNotInProject: [],
    projectRequests: [],
    error: null,
};
export const fetchProjectsThunk = createAsyncThunk("project/fetch", async () => {
    return await projectApi.fetchProjects();
});
export const fetchMyProjectsThunk = createAsyncThunk("project/my-owner-project", async (userId) => {
    return await projectApi.fetchMyProjects(userId);
});
export const fetchProjectById = createAsyncThunk("project/fetch-by-id", async (id) => {
    return await projectApi.fetchProjectById(id);
});
export const createProjectThunk = createAsyncThunk("project/create", async (projectData) => {
    return await projectApi.createProject(projectData);
});
export const updateProjectThunk = createAsyncThunk("project/update", async (projectData) => {
    return await projectApi.updateProject(projectData);
}
);
export const fetchProjectsByOrgThunk = createAsyncThunk("project/fetch-by-org", async (orgId) => {
    return await projectApi.fetchProjectsByOrg(orgId);
});
//members
export const fetchUserNotInProjectThunk = createAsyncThunk("project/members/get-user-not-in-project", async (projectId) => {
    return await projectApi.getUserNotInProject(projectId);
});
export const fetchAllProjectMembersThunk = createAsyncThunk("project/all-members", async (projectId) => {
    return await projectApi.fetchAllProjectMembers(projectId);
});
export const fetchActiveProjectMembers = createAsyncThunk("project/members", async (projectId) => {
    return await projectApi.fetchActiveProjectMembers(projectId);
});
export const addProjectMemberThunk = createAsyncThunk("project/members/add-member", async ({ projectId, userId,role }) => {
    return await projectApi.addProjectMember({ projectId, userId,role });
});
export const moveOutProjectMemberThunk = createAsyncThunk("project/members/move-out", async (memberId) => {
    return await projectApi.moveOutProjectMember(memberId);
});
export const removeProjectMemberThunk = createAsyncThunk("project/members/remove", async (memberId) => {    
    return await projectApi.removeProjectMember(memberId);
});

//requests  
export const fetchProjectRequests = createAsyncThunk("project/requests", async (projectId) => {
    return await projectApi.getAllProjectRequest(projectId);
});
export const inviteProjectMemberThunk = createAsyncThunk("project/members/invite", async ({ projectId, userId }) => {
    return await projectApi.inviteProjectMember({ projectId, userId });
});
export const sendJoinRequestThunk = createAsyncThunk("project/send-join-request", async ({ projectId, requestData }) => {
    return await projectApi.sendJoinRequest({ projectId, requestData });
});
export const cancelProjectRequestThunk = createAsyncThunk("project/cancel-project-request", async (requestId) => {
    return await projectApi.cancelProjectRequest(requestId);
});
export const approveJoinRequestThunk = createAsyncThunk("project/approve-join-request", async (requestId) => {
    return await projectApi.approveJoinRequest(requestId);
});
export const rejectJoinRequestThunk = createAsyncThunk("project/reject-join-request", async (requestId) => {
    return await projectApi.rejectJoinRequest(requestId);
}
);
export const approveLeaveRequestThunk = createAsyncThunk("project/approve-leave-request", async (requestId) => {
    return await projectApi.approveLeaveRequest(requestId);
});
export const rejectLeaveRequestThunk = createAsyncThunk("project/reject-leave-request", async (requestId) => {
    return await projectApi.rejectLeaveRequest(requestId);
}
);
//spending plan
export const fetchSpendingTemplateThunk = createAsyncThunk("project/get-spending-plans", async (projectId) => {
    return await projectApi.getSpendingTemplate(projectId);
});
export const importSpendingPlanThunk = createAsyncThunk("project/import-spending-plan", async ({file,projectId}) => {
    return await projectApi.importSpendingPlan({file, projectId});
});
export const approveSpendingPlanThunk = createAsyncThunk("project/approve-spending-plan", async (planId) => {
    return await projectApi.approveSpendingPlan(planId);
});
export const rejectSpendingPlanThunk = createAsyncThunk("project/reject-spending-plan", async ({planId,reason}) => {
    return await projectApi.rejectSpendingPlan({planId,reason});
});
export const createSpendingPlanThunk = createAsyncThunk("project/create-spending-plan", async (spendingPlanData) => {
    return await projectApi.createSpendingPlan(spendingPlanData);
});
export const fetchSpendingPlanOfProject = createAsyncThunk("project/get-spending-plan", async (projectId) => {
    return await projectApi.getSpendingPlanOfProject(projectId);
});
export const updateSpendingPlanThunk = createAsyncThunk("project/update-spending-plan", async ({planId, dto}) => {
    return await projectApi.updateSpendingPlan({planId, dto});
});
export const deleteSpendingPlanThunk = createAsyncThunk("project/delete-spending-plan", async (spendingPlanId) => {
    return await projectApi.deleteSpendingPlan(spendingPlanId);
});
export const fetchSpendingPlanById = createAsyncThunk("project/get-spending-plan-by-id", async (spendingPlanId) => {
    return await projectApi.getSpendingPlanById(spendingPlanId);
});
//spending item
export const createSpendingItemThunk = createAsyncThunk("project/create-spending-item", async (spendingItemData) => {
    return await projectApi.createSpendingItem(spendingItemData);
});
export const fetchSpendingItemOfPlan = createAsyncThunk("project/get-spending-items", async (planId) => {
    return await projectApi.getItemsByPlan(planId);
});
export const updateSpendingItemThunk = createAsyncThunk("project/update-spending-item", async ({itemId, dto}) => {
    return await projectApi.updateSpendingItem({itemId, dto});
});
export const deleteSpendingItemThunk = createAsyncThunk("project/delete-spending-item", async (spendingItemId) => {
    return await projectApi.deleteSpendingItem(spendingItemId);
});
export const fetchSpendingItemById = createAsyncThunk("project/get-spending-item-by-id", async (spendingItemId) => {
    return await projectApi.getSpendingItemById(spendingItemId);
});
//details
export const fetchSpendingDetailsByProject = createAsyncThunk("project/get-spending-details-by-prid", async (projectId) => {
    return await projectApi.getSpendingDetailsByProject(projectId);
});
export const createSpendingDetailThunk = createAsyncThunk("project/create-spending-details", async (spendingDetails) => {
    return await projectApi.createSpendingDetail(spendingDetails);
});
export const updateSpendingDetailThunk = createAsyncThunk("project/update-spending-detail", async ({id,detailData}) => {
    return await projectApi.updateSpendingDetail({id,detailData});
});
export const deleteSpendingDetailThunk = createAsyncThunk("project/delete-spending-detail", async (spendingDetailId) => {
    return await projectApi.deleteSpendingDetail(spendingDetailId);
}
);

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
            .addCase(fetchProjectsByOrgThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectsByOrgThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjectsByOrgThunk.rejected, (state, action) => {
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
            .addCase(fetchMyProjectsThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyProjectsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.myProjects = action.payload;
            })
            .addCase(fetchMyProjectsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(updateProjectThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProjectThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProject = action.payload;
            })
            .addCase(updateProjectThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            //members 
            .addCase(fetchUserNotInProjectThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserNotInProjectThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.userNotInProject = action.payload;
            })
            .addCase(fetchUserNotInProjectThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchAllProjectMembersThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllProjectMembersThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.allProjectMembers = action.payload;
            })
            .addCase(fetchAllProjectMembersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchActiveProjectMembers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchActiveProjectMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.projectMembers = action.payload;
            })
            .addCase(fetchActiveProjectMembers.rejected, (state, action) => {
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
                const index = state.allProjectMembers.findIndex(req => req.id === action.payload.id);
                if (index !== -1) {
                    // Cập nhật request ở index tìm được bằng dữ liệu mới từ action.payload
                    state.allProjectMembers[index] = {
                        ...state.allProjectMembers[index],
                        ...action.payload
                    };
                }
            })
            .addCase(moveOutProjectMemberThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(removeProjectMemberThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeProjectMemberThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.allProjectMembers = state.allProjectMembers.filter(item => item.id !== action.payload.id);
                state.projectMembers = state.projectMembers.filter(item => item.id !== action.payload.id);
            })
            .addCase(removeProjectMemberThunk.rejected, (state, action) => {
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
            .addCase(inviteProjectMemberThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(inviteProjectMemberThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.projectRequests = state.projectRequests.push(action.payload);
            })
            .addCase(inviteProjectMemberThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(cancelProjectRequestThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelProjectRequestThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.projectRequests.findIndex(req => req.id === action.payload.id);
                if (index !== -1) {
                    // Cập nhật request ở index tìm được bằng dữ liệu mới từ action.payload
                    state.projectRequests[index] = {
                        ...state.projectRequests[index],
                        ...action.payload
                    };
                }
            })
            .addCase(cancelProjectRequestThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(approveJoinRequestThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(approveJoinRequestThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.projectRequests.findIndex(req => req.id === action.payload.id);
                if (index !== -1) {
                    // Cập nhật request ở index tìm được bằng dữ liệu mới từ action.payload
                    state.projectRequests[index] = {
                        ...state.projectRequests[index],
                        ...action.payload
                    };
                }
            })
            .addCase(approveJoinRequestThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(rejectJoinRequestThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(rejectJoinRequestThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.projectRequests.findIndex(req => req.id === action.payload.id);
                if (index !== -1) {
                    // Cập nhật request ở index tìm được bằng dữ liệu mới từ action.payload
                    state.projectRequests[index] = {
                        ...state.projectRequests[index],
                        ...action.payload
                    };
                }
            })
            .addCase(rejectJoinRequestThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(approveLeaveRequestThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(approveLeaveRequestThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.projectRequests.findIndex(req => req.id === action.payload.id);
                if (index !== -1) {
                    // Cập nhật request ở index tìm được bằng dữ liệu mới từ action.payload
                    state.projectRequests[index] = {
                        ...state.projectRequests[index],
                        ...action.payload
                    };
                }
            })
            .addCase(approveLeaveRequestThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(rejectLeaveRequestThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(rejectLeaveRequestThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.projectRequests.findIndex(req => req.id === action.payload.id);
                if (index !== -1) {
                    // Cập nhật request ở index tìm được bằng dữ liệu mới từ action.payload
                    state.projectRequests[index] = {
                        ...state.projectRequests[index],
                        ...action.payload
                    };
                }
            })
            .addCase(rejectLeaveRequestThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            //spending plan 
            .addCase(fetchSpendingTemplateThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSpendingTemplateThunk.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(fetchSpendingTemplateThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            }) 
            .addCase(importSpendingPlanThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(importSpendingPlanThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingPlan = action.payload.plan;
                state.currentSpendingItem = action.payload.items;
            })
            .addCase(importSpendingPlanThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            }) 
            .addCase(approveSpendingPlanThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(approveSpendingPlanThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingPlan = action.payload;
            })
            .addCase(approveSpendingPlanThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            }) 
            .addCase(rejectSpendingPlanThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(rejectSpendingPlanThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingPlan = action.payload;
            })
            .addCase(rejectSpendingPlanThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(createSpendingPlanThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(createSpendingPlanThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingPlan = action.payload;
            })
            .addCase(createSpendingPlanThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            .addCase(fetchSpendingPlanOfProject.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSpendingPlanOfProject.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingPlan = action.payload || {};
            })
            .addCase(fetchSpendingPlanOfProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            .addCase(updateSpendingPlanThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSpendingPlanThunk.fulfilled, (state, action) => {
                state.loading = false;
               state.currentSpendingPlan = action.payload;
            })
            .addCase(updateSpendingPlanThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            .addCase(deleteSpendingPlanThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteSpendingPlanThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingPlan = null;
            })
            .addCase(deleteSpendingPlanThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            .addCase(fetchSpendingPlanById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSpendingPlanById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingPlan = action.payload;
            })
            .addCase(fetchSpendingPlanById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            // --- Spending Item ---
            .addCase(createSpendingItemThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(createSpendingItemThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.spendingItems.push(action.payload);
            })
            .addCase(createSpendingItemThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            .addCase(fetchSpendingItemOfPlan.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSpendingItemOfPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.spendingItems = action.payload;
            })
            .addCase(fetchSpendingItemOfPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            .addCase(updateSpendingItemThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSpendingItemThunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.spendingItems.findIndex(item => item.id === action.payload.id);
                if (index !== -1) state.spendingItems[index] = action.payload;
            })
            .addCase(updateSpendingItemThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            .addCase(deleteSpendingItemThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteSpendingItemThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.spendingItems = state.spendingItems.filter(item => item.id !== action.meta.arg);
            })
            .addCase(deleteSpendingItemThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
    
            .addCase(fetchSpendingItemById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSpendingItemById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingItem = action.payload;
            })
            .addCase(fetchSpendingItemById.rejected, (state, action) => {
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
            .addCase(fetchSpendingDetailsByProject.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSpendingDetailsByProject.fulfilled, (state, action) => {
                state.loading = false;
                state.spendingDetails = action.payload;
            })
            .addCase(fetchSpendingDetailsByProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            }) 
            .addCase(createSpendingDetailThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(createSpendingDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingDetail = action.payload;
            })
            .addCase(createSpendingDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(updateSpendingDetailThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSpendingDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSpendingDetail = action.payload;
            })
            .addCase(updateSpendingDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(deleteSpendingDetailThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteSpendingDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(deleteSpendingDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            ;

    },
});

export default projectSlice.reducer;