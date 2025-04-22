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

// postApi.js
const deletePost = async (id) => {
    try {
      await APIPrivate.delete(`posts/${id}`);
      return id; // Trả về ID để Redux xử lý
    } catch (err) {
      const errorData = err?.response?.data || { message: "Lỗi không xác định" };
      throw new Error(errorData.message);
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
const reportPost = async (postId, data) => {
    try {
      const response = await APIPrivate.post(`posts/${postId}/report`, data);
      return response.data;
    } catch (err) {
      throw err.response?.data || { message: "Lỗi khi báo cáo bài viết" };
    }
  };
  const handleReportSubmit = async () => {
    try {
      await postApi.reportPost(currentPost.post.id, {
        reason: reportReason,
        details: reportDetails
      });
      message.success("Đã gửi báo cáo thành công");
      setReportVisible(false);
    } catch (error) {
      message.error("Gửi báo cáo thất bại: " + error.message);
    }
  };

const postApi = { 
    fetchPosts, 
    createPost, 
    updatePost, 
    deletePost, 
    fetchPostById,
    votePost,
    fetchMyPosts, // <== thêm mới
};


export default postApi;