import { APIPrivate } from '../../config/API/api';

const fetchTags = async () => {
    try {
        const response = await APIPrivate.get('tags');
        console.log("tags: " + response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching tags:", err);
        throw err.response.data;
    }
};

const tagApi = { fetchTags };
export default tagApi;