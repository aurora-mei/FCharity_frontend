import { APIPrivate } from '../../config/API/api';

const fetchRequests = async () => {
    try {
        const response = await APIPrivate.get('requests');
        return response.data;
    } catch (err) {
        console.error("Error fetching requests:", err);
        throw err.response.data;
    }
};

const createRequest = async (requestData) => {
    try {
        const response = await APIPrivate.post('requests', requestData);
        console.log("Request created:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error creating request:", err);
        throw err.response.data;
    }
};

const updateRequest = async (id, requestData) => {
    try {
        const response = await APIPrivate.put(`requests/${id}`, requestData);
        console.log("Request updated:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error updating request:", err);
        throw err.response.data;
    }
};

const deleteRequest = async (id) => {
    try {
        await APIPrivate.delete(`requests/${id}`);
    } catch (err) {
        console.error("Error deleting request:", err);
        throw err.response.data;
    }
};

const requestApi = { fetchRequests, createRequest, updateRequest, deleteRequest };
export default requestApi;