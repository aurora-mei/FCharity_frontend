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

const fetchProjectById = async (id) => {
    try {
        
        const response = await APIPrivate.get(`projects/${id}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching project by ID:", err);
        throw err.response.data;
    }
}
const fetchMyOwnerProject = async (userId) => {
    try {
        const response = await APIPrivate.get(`projects/my-owner-project/${userId}`);
        console.log("My project:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get my project:", err);
        throw err.response.data;
    }
}
//members
const fetchProjectMembers = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/members/${projectId}/active`);
        console.log("Project members:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get project members:", err);
        throw err.response.data;
    }
}
const addProjectMember = async ({projectId,userId}) => {
    try {
        const response = await APIPrivate.post(`projects/members/add-member/${projectId}/${userId}`);
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

const projectApi = { fetchProjects, createProject, fetchProjectById, 
    addProjectMember, fetchProjectMembers,moveOutProjectMember,
    getAllProjectRequest, sendJoinRequest,
     createDonation,getDonationsOfProject};
export default projectApi;