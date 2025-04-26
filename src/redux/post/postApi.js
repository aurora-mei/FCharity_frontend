import { APIPrivate } from '../../config/API/api';
import api from '../../services/api';

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

const updatePost = async (id, postData) => {
    try {
        const response = await APIPrivate.put(`posts/${id}`, postData);
        
        if (!response.data.success) {
            throw new Error(response.data.message || "Update failed");
        }
        
        console.log("Post updated:", response.data.data);
        return response.data.data;
        
    } catch (err) {
        const errorMessage = err.response?.data?.message || 
                           err.message || 
                           "Server error. Please try again later.";
        console.error("Update post error:", {
            error: err,
            request: { id, data: postData }
        });
        throw new Error(errorMessage);
    }
};

const deletePost = async (id) => {
    try {
        const response = await APIPrivate.delete(`posts/${id}`);
        console.log(`Attempting to delete post at: ${APIPrivate.defaults.baseURL}/posts/${id}`); // Thêm dòng này

        if (response.status === 200 || response.status === 204) {
            return response.data;
        }
        throw new Error(`Unexpected status code: ${response.status}`);
    } catch (err) {
        console.error("Error Delete Post:", err);
        // Provide more detailed error information
        const errorMessage = err.response?.status === 404 
            ? "Post not found" 
            : err.response?.data?.message || err.message || "Server error";
        throw new Error(errorMessage);
    }
};

const fetchPostById = async (id) => {
    try {
        const response = await APIPrivate.get(`posts/${id}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching Posts by ID:", err);
        throw err.response?.data || { message: "Server không phản hồi hoặc lỗi không xác định" };
    }
};


const votePost = async (postId, userId, vote) => {
    try {
        const response = await APIPrivate.post(`posts/${postId}/vote`, null, {
            params: { userId, vote }
        });
        return response.data;
    } catch (err) {
        const errorData = err?.response?.data;
        const rawMessage = errorData?.error || err.message || "Unknown error";
        const errorMessage = typeof rawMessage === "string" ? rawMessage : JSON.stringify(rawMessage);
        console.error("Vote post error:", errorMessage);
        throw new Error(errorMessage);
    }
};
const fetchMyPosts = async (userId) => {
    try {
        const response = await APIPrivate.get('posts/mine', {
            params:{
                userId:userId
            }
        });
        console.log(response.data)
        return response.data;
    } catch (err) {
        console.error("Error fetching my posts:", err);
        throw err.response?.data;
    }
};

 
const fetchTopVotedPosts = async (limit = 2) => {
    try {
        const response = await APIPrivate.get(`posts/top-voted?limit=${limit}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching top voted posts:", err);
        throw err.response.data;
    }
};
const reportPost = async (postId, reporterId, reason) => {
    try {
      const response = await APIPrivate.post(
        `posts/${postId}/report`,
        {
          reporterId: reporterId,
          reason: reason
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.data.success) {
        throw new Error(response.data.message || "Report failed");
      }
  
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.message 
        || "Lỗi hệ thống khi gửi báo cáo";
      
      console.error("Report post error:", {
        error: err,
        postId,
        reporterId,
        reason
      });
      
      throw new Error(errorMessage);
    }
  };
  const hidePost = async (postId, userId) => {
    try {
      const response = await APIPrivate.post(
        `posts/${postId}/hide`,
        null,
        {
          params: { userId }
        }
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      throw new Error(errorMessage);
    }
  };
  
  const unhidePost = async (postId, userId) => {
    try {
      const response = await APIPrivate.post(`posts/${postId}/unhide`, null, {
        params: { userId }
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      throw new Error(errorMessage);
    }
  };
const postApi = { 
    fetchPosts, 
    createPost, 
    updatePost, 
    deletePost, 
    fetchPostById,
    votePost,
    fetchMyPosts,
    fetchTopVotedPosts,
    reportPost,
    hidePost,
    unhidePost
};


export default postApi;