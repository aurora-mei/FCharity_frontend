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

const fetchActiveRequests = async () => {
    try {
        const response = await APIPrivate.get('requests/active');
        return response.data;
    } catch (err) {
        console.error("Error fetching active requests:", err);
        throw err.response ? err.response.data : err;
    }
};

const createRequest = async (requestData) => {
    try {
        const response = await APIPrivate.post('requests/create', requestData);
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
const fetchRequestById = async (id) => {
    try {
        const response = await APIPrivate.get(`requests/${id}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching request by ID:", err);
        throw err.response.data;
    }
}

// Hàm API lấy request theo userId với filter
export const fetchRequestsByUserId = async (userId, filters = {}) => {
    try {
        // Xây dựng query string từ filters
        const queryParams = new URLSearchParams(filters).toString();
        const url = queryParams ? `requests/user/${userId}?${queryParams}` : `requests/user/${userId}`;
        const response = await APIPrivate.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching requests by user id:", error);
        throw error.response?.data || error;
    }
};

const requestApi = { fetchRequests, createRequest, updateRequest, deleteRequest, fetchRequestById, fetchActiveRequests, fetchRequestsByUserId };
export default requestApi;