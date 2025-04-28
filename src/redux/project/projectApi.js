import { message } from 'antd';
import { APIPrivate } from '../../config/API/api';
import { saveAs } from 'file-saver';



const fetchProjects = async () => {
    try {
        const response = await APIPrivate.get('projects');
        console.log("posts: " + response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching projects:", err);
        throw err.response.data;
    }
};
const fetchProjectsNeedDonate = async()=>{
    try {
        const response = await APIPrivate.get('projects/need-donate');
        console.log("posts: " + response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching project need donate:", err);
        throw err.response.data;
    }
}
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
const fetchProjectsByOrg = async (orgId) => {
    try {
        const response = await APIPrivate.get(`projects/org/${orgId}`);
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
const addProjectMember = async ({ projectId, userId, role }) => {
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
        message.success("Move out project member successful");
        return response.data;
    } catch (err) {
        message.error("Error move out project member");
        console.error("Error get project members:", err);
        throw err.response.data;
    }
}
const removeProjectMember = async (memberId) => {
    try {
        const response = await APIPrivate.post(`projects/members/remove/${memberId}`);
        console.log("Project members:", response.data);
        message.success("Remove project member successful");
        return response.data;
    } catch (err) {
        message.error("Error remove project member");
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
const sendJoinRequest = async ({ projectId, requestData }) => {
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
const inviteProjectMember = async ({ projectId, userId }) => {
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
const cancelProjectRequest = async (requestId) => {
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
const approveJoinRequest = async (requestId) => {
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
const rejectJoinRequest = async (requestId) => {
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
const approveLeaveRequest = async (requestId) => {
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
const rejectLeaveRequest = async (requestId) => {
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
export const getSpendingTemplate = async (projectId) => { // Rename for clarity
    try {
        const response = await APIPrivate.get(
            `projects/spending/${projectId}/download-template`,
            {
                responseType: 'blob', // *** CRITICAL: Tell Axios to expect binary data (Blob) ***
            }
        );
        const blob = new Blob([response.data], {
            type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // Get MIME type from header or default
        });

        // 2. Extract filename from Content-Disposition header (optional but recommended)
        let filename = 'spending_template.xlsx'; // Default filename
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(contentDisposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        console.log("filename", filename);
        // 3. Use FileSaver.js (or manual method) to save the blob
        saveAs(blob, filename);

        // No need to return response.data here as it's handled by FileSaver
        // message.success("Template downloaded successfully."); // Optional success message

    } catch (err) {
        message.error("Failed to download spending template");
        console.error("Error downloading Spending Template:", err);
        // Handle specific error responses if needed
        // Consider checking err.response.status or err.response.data if backend sends error details as JSON even on failure
        // If the response for an error is also a blob, you might need to read it differently
        if (err.response && err.response.data instanceof Blob && err.response.data.type.toLowerCase().indexOf('json') !== -1) {
            // Try reading the Blob as JSON text if it's an error response
            try {
                const errorJson = await err.response.data.text();
                const errorData = JSON.parse(errorJson);
                console.error("Error details:", errorData);
                message.error(errorData.message || "An error occurred during download."); // Show more specific error
                throw errorData;
            } catch (parseError) {
                console.error("Could not parse error blob:", parseError);
                throw new Error("An unknown error occurred during download.");
            }
        } else {
            // Throw original error or a generic one
            throw err.response?.data || new Error("An unknown error occurred during download.");
        }
    }
};

export const importSpendingPlan = async ({ file, projectId }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await APIPrivate.post(`projects/spending/${projectId}/save-items-from-template`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        message.success("Spending plan imported successfully");
        console.log("Imported Spending Plan:", response.data);
        return response.data;
    } catch (err) {
        message.error(`Failed to import spending plan: ${err.response?.data?.message || ""}`);
        console.error("Error importing Spending Plan:", err);
        throw err.response?.data;
    }
};

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

export const getSpendingPlanOfProject = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/spending/${projectId}/plan`);
        console.log("Fetched Spending Plan:", response.data);
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

export const updateSpendingPlan = async ({ planId, dto }) => {
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
export const approveSpendingPlan = async (planId) => {
    try {
        const response = await APIPrivate.post(`projects/spending/plans/${planId}/approve`);
        console.log("Spending plan approved:", response.data);
        message.success("Spending plan approved successfully");
        return response.data;
    } catch (err) {
        console.error("Error approving spending plan:", err);
        message.error("Error approving spending plan");
        throw err.response.data;
    }

}
export const rejectSpendingPlan = async ({ planId, reason }) => {
    try {
        const response = await APIPrivate.post(`projects/spending/plans/${planId}/reject`, null,
            {
                params: {
                    reason: reason
                }
            }
        );
        console.log("Spending plan rejected:", response.data);
        message.success("Spending plan rejected successfully");
        return response.data;
    } catch (err) {
        console.error("Error rejecting spending plan:", err);
        message.error("Error rejecting spending plan");
        throw err.response.data;
    }

}
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

export const updateSpendingItem = async ({ itemId, dto }) => {
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
//spending details
export const getSpendingDetailsByProject = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/spending/${projectId}/details`);
        console.log("Spending details:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching spending details:", err);
        throw err.response.data;
    }
}
export const createSpendingDetail = async (detailData) => {
    try {
        const response = await APIPrivate.post(`projects/spending/details/create`, detailData);
        console.log("Spending detail create:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching spending details:", err);
        throw err.response.data;
    }
}
export const updateSpendingDetail = async ({ id, detailData }) => {
    try {
        const response = await APIPrivate.put(`projects/spending/details/${id}`, detailData);
        console.log("Spending detail create:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching spending details:", err);
        throw err.response.data;
    }
}
export const deleteSpendingDetail = async (id) => {
    try {
        console.log("idd", id);
        const response = await APIPrivate.delete(`projects/spending/details/${id}`);
        console.log("Spending detail create:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching spending details:", err);
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
    } catch (err) {
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
//extra fund request

//withdraw request
const getAllWithdrawRequest = async () => {
    try {
        const response = await APIPrivate.get(`/withdraw-requests`);
        console.log("Project withdraw requests:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get withdraw requests:", err);
        throw err.response.data;
    }
}
const getWithdrawRequestByProjectId = async (reqId) => {
    try {
        const response = await APIPrivate.get(`/withdraw-requests/project/${reqId}`);
        console.log("Project withdraw request by project id:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get withdraw request by project id:", err);
        throw err.response.data;
    }
}
const sendWithdrawRequest = async ({ projectId, bankInfo }) => {
    try {
        const response = await APIPrivate.post(`/withdraw-requests/create`, null, {
            params: {
                projectId: projectId,
                bankBin: bankInfo.bankBin,
                accountNumber: bankInfo.accountNumber,
                accountHolder: bankInfo.accountHolder,
            }
        });
        message.success("Send withdraw request successfully");
        return response.data;
    } catch (err) {
        console.error("Error send withdraw req:", err);
        message.error("Send withdraw request failed");
        throw err.response.data;
    }
}
const updateBankInfoWithdraw = async ({ reqId, bankInfo }) => {
    try {
        const response = await APIPrivate.put(`/withdraw-requests/${id}/update-bank-info`, null, {
            params: {
                bankBin: bankInfo.bankBin,
                accountNumber: bankInfo.accountNumber,
                accountHolder: bankInfo.accountHolder,
            }
        });
        message.success("Update bank info successfully");
        return response.data;
    } catch (err) {
        mess.error("Error update bank info:", err);
        message.error("Update bank info failed");
        throw err.response.data;
    }
}
const updateConfirmWithdraw = async (id) => {
    try {
        const response = await APIPrivate.put(`withdraw-requests/${id}/update-confirm`);
        message.success("Update confirm withdraw successfully");
        return response.data;
    } catch (err) {
        message.error("Update confirm withdraw failed");
        console.error("Error updating confirm withdraw:", err);
        throw err.response.data;
    }
}

const updateErrorWithdraw = async ({ id, note }) => {
    try {
        const response = await APIPrivate.put(`withdraw-requests/${id}/update-error`, null,
            {
                params: {
                    note: note
                }
            }
        );
        message.success("Update error withdraw successfully");
        return response.data;
    } catch (err) {
        message.error("Update error withdraw failed");
        console.error("Error updating error withdraw:", err);
        throw err.response.data;
    }
}

export const getExpenseTemplate = async (projectId) => { // Rename for clarity
    try {
        const response = await APIPrivate.get(
            `projects/spending/${projectId}/download-template-expense`,
            {
                responseType: 'blob', // *** CRITICAL: Tell Axios to expect binary data (Blob) ***
            }
        );
        const blob = new Blob([response.data], {
            type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // Get MIME type from header or default
        });

        // 2. Extract filename from Content-Disposition header (optional but recommended)
        let filename = 'expense_template.xlsx'; // Default filename
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(contentDisposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        console.log("filename", filename);
        // 3. Use FileSaver.js (or manual method) to save the blob
        saveAs(blob, filename);

        // No need to return response.data here as it's handled by FileSaver
        // message.success("Template downloaded successfully."); // Optional success message

    } catch (err) {
        message.error("Failed to download expense template");
        console.error("Error downloading expense Template:", err);
        // Handle specific error responses if needed
        // Consider checking err.response.status or err.response.data if backend sends error details as JSON even on failure
        // If the response for an error is also a blob, you might need to read it differently
        if (err.response && err.response.data instanceof Blob && err.response.data.type.toLowerCase().indexOf('json') !== -1) {
            // Try reading the Blob as JSON text if it's an error response
            try {
                const errorJson = await err.response.data.text();
                const errorData = JSON.parse(errorJson);
                console.error("Error details:", errorData);
                message.error(errorData.message || "An error occurred during download."); // Show more specific error
                throw errorData;
            } catch (parseError) {
                console.error("Could not parse error blob:", parseError);
                throw new Error("An unknown error occurred during download.");
            }
        } else {
            // Throw original error or a generic one
            throw err.response?.data || new Error("An unknown error occurred during download.");
        }
    }
};
export const importExpenses = async ({ file, projectId }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await APIPrivate.post(`projects/spending/${projectId}/save-expenses-from-template`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        message.success("Expenses imported successfully");
        console.log("Imported Expenses:", response.data);
        return response.data;
    } catch (err) {
        message.error(`Failed to import expenses: ${err.response?.data?.message || ""}`);
        console.error("Error importing expenses:", err);
        throw err.response?.data;
    }
};
const getProjectWallet = async (walletId) => {
    try {
        const response = await APIPrivate.get(`projects/wallet/${walletId}`);
        console.log("Project wallet:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get project wallet:", err);
        throw err.response.data;
    }
}
//confirm request

const sendConfirmReceiveRequest = async (projectId) => {

    try {
        const response = await APIPrivate.post(`projects/confirmation-requests/${projectId}`);
        console.log("Confirm receive request:", response.data);
        message.success("Confirm receive request sent successfully");
        return response.data;
    } catch (err) {
        console.error("Error send confirm receive request:", err);
        message.error("Error sending confirm receive request");
        throw err.response.data;
    }
}
const confirmReceiveRequest = async ({ id, me }) => {

    try {
        const response = await APIPrivate.put(`projects/confirmation-requests/${id}/confirm`, {
            message: me
        });
        console.log("Confirm receive request:", response.data);
        message.success("Confirm receive request successfully!");
        return response.data;
    } catch (err) {
        console.error("Error confirm receive request:", err);
        message.error("Error confirming receive request");
        throw err.response.data;
    }
}
const getConfirmReceiveRequestByProject = async (projectId) => {
    try {
        const response = await APIPrivate.get(`projects/confirmation-requests/project/${projectId}`);
        console.log("Confirm receive request:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get confirm receive request:", err);
        throw err.response.data;
    }
}
const getConfirmReceiveRequestByRequest = async (requestId) => {
    try {
        const response = await APIPrivate.get(`projects/confirmation-requests/request/${requestId}`);
        console.log("Confirm receive request:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get confirm receive request:", err);
        throw err.response.data;
    }
}
const rejectReceiveRequest = async ({ id, me }) => {
    try {
        const response = await APIPrivate.put(`projects/confirmation-requests/${id}/reject`, {
            message: me
        });
        console.log("Confirm receive request:", response.data);
        message.success("Confirm receive request rejected successfully! The project will be checked again before send you another confirm request!");
        return response.data;
    } catch (err) {
        console.error("Error reject receive request:", err);
        message.error("Error rejecting receive request");
        throw err.response.data;
    }
}
const projectApi = {
    sendConfirmReceiveRequest, confirmReceiveRequest, getConfirmReceiveRequestByProject, getConfirmReceiveRequestByRequest,rejectReceiveRequest,
    fetchProjects,fetchProjectsNeedDonate, createProject, fetchProjectById, fetchMyProjects, updateProject, fetchProjectsByOrg,
    getUserNotInProject, addProjectMember, fetchAllProjectMembers, fetchActiveProjectMembers, moveOutProjectMember, removeProjectMember, inviteProjectMember,
    getAllProjectRequest, sendJoinRequest, cancelProjectRequest, approveJoinRequest, rejectJoinRequest,
    approveLeaveRequest, rejectLeaveRequest,
    getSpendingTemplate, importSpendingPlan, approveSpendingPlan, rejectSpendingPlan,
    createSpendingDetail, getSpendingDetailsByProject, updateSpendingDetail, deleteSpendingDetail,
    getSpendingPlanOfProject, createSpendingPlan, getSpendingPlanById, updateSpendingPlan, deleteSpendingPlan,
    createSpendingItem, getSpendingItemById, updateSpendingItem, deleteSpendingItem, getItemsByPlan,
    createDonation, getDonationsOfProject,
    getExpenseTemplate, importExpenses,
    getWithdrawRequestByProjectId, sendWithdrawRequest, updateBankInfoWithdraw, updateConfirmWithdraw, updateErrorWithdraw, getProjectWallet
};
export default projectApi;