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

const projectApi = { fetchProjects, createProject, fetchProjectById, addProjectMember, fetchProjectMembers,moveOutProjectMember};
export default projectApi;