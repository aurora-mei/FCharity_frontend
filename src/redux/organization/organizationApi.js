import {APIPrivate} from '../../config/API/api';
const getMyOrganization = async (userId) => {
    try {
        const response = await APIPrivate.get(`api/organizations/my-organization/${userId}`);
        console.log("My org:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get my org:", err);
        throw err.response.data;
    }
};
const getOrganizationMembers= async (organizationId) => {
    try {
        const response = await APIPrivate.get(`api/organization-members/${organizationId}`);
        console.log("organizationId members:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error get org members:", err);
        throw err.response.data;
    }
};
const organizationApi = { getMyOrganization,getOrganizationMembers};
export default organizationApi;