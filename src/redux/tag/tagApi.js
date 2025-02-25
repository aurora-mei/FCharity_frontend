import { APIPrivate } from '../../config/API/api';

const fetchTags = async () => {
    try {
        const response = await APIPrivate.get(`tags`);
        return response.data;
    } catch (err) {
        console.error("Error fetching tags:", err);
        throw err.response.data;
    }
};

const tagApi = { fetchTags };
export default tagApi;