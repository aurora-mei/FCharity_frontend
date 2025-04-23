import { APIPrivate } from '../../config/API/api';
import { message } from 'antd';
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
const fetchTransferRequestByRequestId = async (requestId) => {
    try {
        const response = await APIPrivate.get(`requests/${requestId}/transfer-request`);
        return response.data;
    } catch (err) {
        console.error("Error fetching confirmation request by ID:", err);
        throw err.response.data;
    }
}
const updateBankInfo = async ({id, bankInfo}) => {
    try {
        const response = await APIPrivate.put(`/transfer-requests/${id}/update-bank-info`, null, {
            params: {
              bankBin: bankInfo.bankBin,
              accountNumber: bankInfo.accountNumber,
              accountHolder: bankInfo.accountHolder,
            }});
            message.success("Update bank info successfully");
        return response.data;
    } catch (err) {
        console.error("Error updating bank info:", err);
        message.error("Update bank info failed");
        throw err.response.data;
    }
} 
const updateConfirmTransfer = async (id) => {
    try {
        const response = await APIPrivate.put(`transfer-requests/${id}/update-confirm-transfer`);
        message.success("Update confirm transfer successfully");
        return response.data;
    } catch (err) {
        message.error("Update confirm transfer failed");
        console.error("Error updating confirm transfer:", err);
        throw err.response.data;
    }
}

const updateErrorTransfer = async ({id,note}) => {
    try {
        const response = await APIPrivate.put(`transfer-requests/${id}/update-error-transfer`,null,
           {
            params:{
                note: note
            }
           }
        );
        message.success("Update error transfer successfully");
        return response.data;
    } catch (err) {
        message.error("Update error transfer failed");
        console.error("Error updating error transfer:", err);
        throw err.response.data;
    }
}
const requestApi = { fetchRequests, createRequest, updateRequest, deleteRequest, fetchRequestById, fetchActiveRequests,
     fetchRequestsByUserId, fetchTransferRequestByRequestId,updateBankInfo,updateConfirmTransfer,updateErrorTransfer };
export default requestApi;