import { APIPrivate } from '../../config/API/api';
import { message } from 'antd';

export const getAllPhasesByProjectId = async (projectId) => {
    try {
        const res = await APIPrivate.get(`/projects/timeline/by-projectId/${projectId}`);
        console.log("Phases:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error get phases:", err);
        throw err.response.data;
    }
};

export const getPhaseById = async (phaseId) => {
    try {
        const res = await APIPrivate.get(`/projects/timeline/by-id/${phaseId}`);
        console.log("Phase:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error get phase:", err);
        throw err.response.data;
    }
};

export const createPhase = async (data) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/create`, data);
        message.success("Created phase successfully");
        return res.data;
    } catch (err) {
        console.error("Error create phase:", err);
        message.error("Failed to create phase");
        throw err.response.data;
    }
};

export const updatePhase = async (data) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/update`, data);
        message.success("Updated phase successfully");
        return res.data;
    } catch (err) {
        console.error("Error update phase:", err);
        message.error("Failed to update phase");
        throw err.response.data;
    }
};

export const endPhase = async (data) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/end`, data);
        message.success("Ended phase successfully");
        return res.data;
    } catch (err) {
        console.error("Error end phase:", err);
        message.error("Failed to end phase");
        throw err.response.data;
    }
};

export const cancelPhase = async (phaseId) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/${phaseId}/cancel`);
        message.success("Canceled phase successfully");
        return res.data;
    } catch (err) {
        console.error("Error cancel phase:", err);
        message.error("Failed to cancel phase");
        throw err.response.data;
    }
};

export const getTasksOfPhase = async (phaseId) => {
    try {
        const res = await APIPrivate.get(`/projects/timeline/${phaseId}/tasks`);
        console.log("Tasks of phase:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error get tasks of phase:", err);
        throw err.response.data;
    }
};
export const getTasksOfProject = async(projectId)=>{
    try {
        const res = await APIPrivate.get(`/projects/timeline/project/${projectId}/tasks`);
        console.log("Tasks of project:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error get tasks of project:", err);
        throw err.response.data;
    }
}
export const getSubtasksOfTask = async (taskId) => {
    try {
        const res = await APIPrivate.get(`/projects/timeline/${taskId}/subtasks`);
        console.log("Subtasks:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error get subtasks:", err);
        throw err.response.data;
    }
};

export const addTaskToPhase = async (phaseId, taskData) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/${phaseId}/create`, taskData);
        message.success("Created task successfully");
        return res.data;
    } catch (err) {
        console.error("Error add task:", err);
        message.error("Failed to create task");
        throw err.response.data;
    }
};
export const getTaskById = async (taskId) => {
    try {
        const res = await APIPrivate.get(`/projects/timeline/task/${taskId}`);
        console.log("Task:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error get task:", err);
        throw err.response.data;
    }
};

export const updateTaskOfPhase = async (taskId, taskData) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/${taskId}/update`, taskData);
        message.success("Updated task successfully");
        return res.data;
    } catch (err) {
        console.error("Error update task:", err);
        message.error("Failed to update task");
        throw err.response.data;
    }
};

export const cancelTaskOfPhase = async (taskId) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/${taskId}/cancel-task`);
        message.success("Canceled task successfully");
        return res.data;
    } catch (err) {
        console.error("Error cancel task:", err);
        message.error("Failed to cancel task");
        throw err.response.data;
    }
};

export const getAllTaskStatuses = async (projectId) => {
    try {
        const res = await APIPrivate.get(`/projects/timeline/task-status/${projectId}`);
        console.log("Task statuses:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error get task statuses:", err);
        throw err.response.data;
    }
};

export const addTaskStatus = async (statusData) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/task-status/add`, statusData);
        message.success("Added task status successfully");
        return res.data;
    } catch (err) {
        console.error("Error add task status:", err);
        message.error("Failed to add task status");
        throw err.response.data;
    }
};

export const updateTaskStatus = async (statusData) => {
    try {
        const res = await APIPrivate.post(`/projects/timeline/task-status/update`, statusData);
        message.success("Updated task status successfully");
        return res.data;
    } catch (err) {
        console.error("Error update task status:", err);
        message.error("Failed to update task status");
        throw err.response.data;
    }
};

export const deleteTaskStatus = async (statusId) => {
    try {
        const res = await APIPrivate.delete(`/projects/timeline/${statusId}/delete`);
        message.success("Deleted task status successfully");
        return res.data;
    } catch (err) {
        console.error("Error delete task status:", err);
        message.error("Failed to delete task status");
        throw err.response.data;
    }
};

const timelineApi = {
    getAllPhasesByProjectId, getPhaseById,createPhase,updatePhase,endPhase,cancelPhase,getTasksOfProject,
    getTasksOfPhase,getSubtasksOfTask,addTaskToPhase,updateTaskOfPhase,cancelTaskOfPhase,
    getAllTaskStatuses,addTaskStatus,updateTaskStatus,deleteTaskStatus
};
export default timelineApi;