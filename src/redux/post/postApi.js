import { APIPrivate } from '../../config/API/api';

const fetchPosts = async () => {
    try {
        const response = await APIPrivate.get('posts');
        console.log("posts: " + response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching posts:", err);
        throw err.response.data;
    }
};
const createPost = async (PostsData) => {
    try {
        const response = await APIPrivate.post('posts', PostsData);
        console.log("Posts created:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error creating Posts:", err);
        throw err.response.data;
    }
};

const updatePost = async (id, PostsData) => {
    try {
        const response = await APIPrivate.put(`posts/${id}`, PostsData);
        console.log("Posts updated:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error updating Posts:", err);
        throw err.response.data;
    }
};

const deletePost = async (id) => {
    try {
        await APIPrivate.delete(`posts/${id}`);
    } catch (err) {
        console.error("Error deleting Posts:", err);
        throw err.response.data;
    }
};
const fetchPostById = async (id) => {
    try {
        
        const response = await APIPrivate.get(`posts/${id}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching Posts by ID:", err);
        throw err.response.data;
    }
}

const postApi = { fetchPosts, createPost, updatePost, deletePost, fetchPostById };
export default postApi;