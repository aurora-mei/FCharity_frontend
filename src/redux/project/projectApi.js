import { message } from 'antd';
import { APIPrivate } from '../../config/API/api';

const fetchProjects = async () => {
    try {
        const response = await APIPrivate.get('projects');
        console.log("posts: " + response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching posts:", err);
        throw err.response.data;
    }
};
const createProject = async (ProjectData) => {
    try {
        const response = await APIPrivate.post('projects/create', ProjectData);
        console.log("Project created:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error createProject:", err);
        throw err.response.data;
    }
};
const updateProject = async (ProjectData) => {
    try {
        console.log("Project data:", ProjectData);
        const response = await APIPrivate.put('projects/update', ProjectData);
        console.log("Project updated:", response.data);
        message.success("Project updated successfully");
        return response.data;
    } catch (err) {
        console.error("Error createProject:", err);
        message.error("Error updating project");
        throw err.response.data;
    }
};

const fetchProjectById = async (id) => {
    try {
        
        const response = await APIPrivate.get(`projects/${id}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching project by ID:", err);
        throw err.response.data;
    }
}
const fetchMyProjects = async (userId) => {
    try {
        const response = await APIPrivate.get(`projects/my-project/${userId}`);
        console.log("My project:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get my project:", err);
        throw err.response.data;
    }
}
//members
const fetchAllProjectMembers = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/members/${projectId}`);
        console.log("Project members:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get project members:", err);
        throw err.response.data;
    }
}
const fetchActiveProjectMembers = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/members/${projectId}/active`);
        console.log("Project members:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get project members:", err);
        throw err.response.data;
    }
}
const addProjectMember = async ({projectId,userId,role}) => {
    try {
        const response = await APIPrivate.post(`projects/members/add-member/${projectId}/${userId}/${role}`); 
        console.log("Project members:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get project members:", err);
        throw err.response.data;
    }
}
const moveOutProjectMember = async (memberId) => {
    try {
        const response = await APIPrivate.post(`projects/members/move-out/${memberId}`);
        console.log("Project members:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get project members:", err);
        throw err.response.data;
    }
}

//project-request
const getUserNotInProject = async (projectId) => {
    try {
        const response = await APIPrivate.get(`users/not-in-project/${projectId}`);
        console.log("Users not in project:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error Users not in project:", err);
        throw err.response.data;
    }
}
const getAllProjectRequest = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/requests/${projectId}`);
        console.log("Project requests:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get project requests:", err);
        throw err.response.data;
    }
}
const sendJoinRequest = async ({projectId,requestData}) => {
    try {
         console.log("Join request sentbb:", projectId, requestData);
        const response = await APIPrivate.post(`projects/requests/${projectId}/join`, requestData);
        console.log("Join request sent:", response.data);
        message.success("Join request sent successfully");
        setTimeout(() => {
            window.location.reload();
        }, 2000); 
        return response.data;
    } catch (err) {
        console.error("Error sending join request:", err);
        message.error("Error sending join request");
        throw err.response.data;
    }
}
const inviteProjectMember = async ({projectId, userId}) => {
    try {
        console.log("Invite request sent:", projectId, userId);
        const response = await APIPrivate.post(`projects/requests/${projectId}/invite/${userId}`);
        console.log("Project members:", response.data);
        message.success("Invite sent successfully");
        return response.data;
    } catch (err) {
        console.error("Error sending invite:", err);
        message.error("Error sending invite");
        throw err.response.data;
    }
}
const cancelProjectRequest = async(requestId)=>{
    try {
        const response = await APIPrivate.post(`projects/requests/${requestId}/cancel`);
        console.log("Project request cancelled:", response.data);
        message.success("Request cancelled successfully");
        return response.data;
    } catch (err) {
        console.error("Error cancel request:", err);
        message.error("Error cancelling request");
        throw err.response.data;
    }
}
const approveJoinRequest = async(requestId)=>{
    try {
        const response = await APIPrivate.post(`projects/requests/${requestId}/approve-join`);
        console.log("Project request approved:", response.data);
        message.success("Join request approved successfully");
        return response.data;
    } catch (err) {
        console.error("Error approving join request:", err);
        message.error("Error approving join request");
        throw err.response.data;
    }
}
const rejectJoinRequest = async(requestId)=>{
    try {
        const response = await APIPrivate.post(`projects/requests/${requestId}/reject-join`);
        console.log("Project request rejected:", response.data);
        message.success("Join request rejected successfully");
        return response.data;
    } catch (err) {
        console.error("Error rejecting join request:", err);
        message.error("Error rejecting join request");
        throw err.response.data;
    }
}
const approveLeaveRequest = async(requestId)=>{
    try {
        const response = await APIPrivate.post(`projects/requests/${requestId}/approve-move-out`);
        console.log("Project request approved:", response.data);
        message.success("Join request approved successfully");
        return response.data;
    } catch (err) {
        console.error("Error approving join request:", err);
        message.error("Error approving join request");
        throw err.response.data;
    }
}
const rejectLeaveRequest = async(requestId)=>{
    try {
        const response = await APIPrivate.post(`projects/requests/${requestId}/reject-move-out`);
        console.log("Project request rejected:", response.data);
        message.success("Join request rejected successfully");
        return response.data;
    } catch (err) {
        console.error("Error rejecting:", err);
        message.error("Error rejecting join request");
        throw err.response.data;
    }
}
// ===== SPENDING PLAN =====
export const createSpendingPlan = async (dto) => {
    try {
        const response = await APIPrivate.post(`projects/spending/plans`, dto);
        message.success("Spending plan created successfully");
        console.log("Created Spending Plan:", response.data);
        return response.data;
    } catch (err) {
        message.error("Failed to create spending plan");
        console.error("Error creating Spending Plan:", err);
        throw err.response?.data;
    }
};

export const getSpendingPlansOfProject = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/spending/${projectId}/plan`);
        // message.success("Fetched project spending plan successfully");
        console.log("Fetched Spending Plans:", response.data);
        return response.data;
    } catch (err) {
        // message.error("Failed to fetch project spending plan");
        console.error("Error fetching Spending Plans:", err);
        throw err.response?.data;
    }
};

export const getSpendingPlanById = async (planId) => {
    try {
        const response = await APIPrivate.get(`projects/spending/plans/${planId}`);
        // message.success("Fetched spending plan successfully");
        console.log("Fetched Spending Plan:", response.data);
        return response.data;
    } catch (err) {
        // message.error("Failed to fetch spending plan");
        console.error("Error fetching Spending Plan:", err);
        throw err.response?.data;
    }
};

export const updateSpendingPlan = async ({planId, dto}) => {
    try {
        const response = await APIPrivate.put(`projects/spending/plans/${planId}`, dto);
        message.success("Spending plan updated successfully");
        console.log("Updated Spending Plan:", response.data);
        return response.data;
    } catch (err) {
        message.error("Failed to update spending plan");
        console.error("Error updating Spending Plan:", err);
        throw err.response?.data;
    }
};

export const deleteSpendingPlan = async (planId) => {
    try {
        await APIPrivate.delete(`projects/spending/plans/${planId}`);
        message.success("Spending plan deleted successfully");
        console.log("Deleted Spending Plan");
    } catch (err) {
        message.error("Failed to delete spending plan");
        console.error("Error deleting Spending Plan:", err);
        throw err.response?.data;
    }
};

// ===== SPENDING ITEM =====
export const createSpendingItem = async (dto) => {
    try {
        const response = await APIPrivate.post(`projects/spending/items`, dto);
        message.success("Spending item created successfully");
        console.log("Created Spending Item:", response.data);
        return response.data;
    } catch (err) {
        message.error("Failed to create spending item");
        console.error("Error creating Spending Item:", err);
        throw err.response?.data;
    }
};

export const getSpendingItemById = async (itemId) => {
    try {
        const response = await APIPrivate.get(`projects/spending/items/${itemId}`);
        // message.success("Fetched spending item successfully");
        console.log("Fetched Spending Item:", response.data);
        return response.data;
    } catch (err) {
        // message.error("Failed to fetch spending item");
        console.error("Error fetching Spending Item:", err);
        throw err.response?.data;
    }
};

export const updateSpendingItem = async ({itemId, dto}) => {
    try {
        const response = await APIPrivate.put(`projects/spending/items/${itemId}`, dto);
        message.success("Spending item updated successfully");
        console.log("Updated Spending Item:", response.data);
        return response.data;
    } catch (err) {
        message.error("Failed to update spending item");
        console.error("Error updating Spending Item:", err);
        throw err.response?.data;
    }
};

export const deleteSpendingItem = async (itemId) => {
    try {
        await APIPrivate.delete(`projects/spending/items/${itemId}`);
        message.success("Spending item deleted successfully");
        console.log("Deleted Spending Item");
    } catch (err) {
        message.error("Failed to delete spending item");
        console.error("Error deleting Spending Item:", err);
        throw err.response?.data;
    }
};

export const getItemsByPlan = async (planId) => {
    try {
        const response = await APIPrivate.get(`projects/spending/plans/${planId}/items`);
        // message.success("Fetched items of spending plan successfully");
        console.log("Spending Items of Plan:", response.data);
        return response.data;
    } catch (err) {
        // message.error("Failed to fetch spending items");
        console.error("Error fetching Spending Items by Plan:", err);
        throw err.response?.data;
    }
};

//donations
const createDonation = async (donationData) => {
    try {
        const response = await APIPrivate.post('projects/donations/create', donationData);
        console.log("Donation created:", response.data);
        message.success("Donation created successfully");
        return response.data;
    }catch (err) {
        console.error("Error creating donation:", err);
        message.error("Error creating donation");
        throw err.response.data;
    }
}
const getDonationsOfProject = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/donations/${projectId}`);
        console.log("Project donations:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get project donations:", err);
        throw err.response.data;
    }
}

const projectApi = { fetchProjects, createProject, fetchProjectById, fetchMyProjects,updateProject,
    getUserNotInProject, addProjectMember,fetchAllProjectMembers, fetchActiveProjectMembers,moveOutProjectMember,inviteProjectMember,
    getAllProjectRequest, sendJoinRequest, cancelProjectRequest,approveJoinRequest,rejectJoinRequest,
    approveLeaveRequest,rejectLeaveRequest,
    getSpendingPlansOfProject, createSpendingPlan, getSpendingPlanById, updateSpendingPlan, deleteSpendingPlan,
    createSpendingItem,getSpendingItemById,updateSpendingItem,deleteSpendingItem,getItemsByPlan,
     createDonation,getDonationsOfProject};
export default projectApi;