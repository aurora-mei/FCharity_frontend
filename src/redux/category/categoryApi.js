import { APIPrivate } from '../../config/API/api';

const fetchCategories = async () => {
    try {
        const response = await APIPrivate.get('categories');
        return response.data;
    } catch (err) {
        console.error("Error fetching categories:", err);
        throw err.response.data;
    }
};

const categoryApi = { fetchCategories };
export default categoryApi;