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
        return response.data;
    } catch (err) {
        console.error("Error creating request:", err);
        throw err.response.data;
    }
};

const requestApi = { fetchRequests, createRequest };
export default requestApi;