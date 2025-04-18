import { APIPrivate } from '../../config/API/api';

const fetchCommentsByPost = async (postId, page = 0, size = 100) => {
    try {
        const response = await APIPrivate.get(`comments/post/${postId}`, {
            params: { page, size }
        });
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
const fetchAllCommentsByPost = async (postId) => {
    try {
        const response = await APIPrivate.get(`comments/post/${postId}/all`);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
const createComment = async (commentData) => {
    try {
        const response = await APIPrivate.post('comments', commentData);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};

const updateComment = async (commentId, commentData) => {
    try {
        const response = await APIPrivate.put(`comments/${commentId}`, commentData);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};

const deleteComment = async (commentId) => {
    try {
        await APIPrivate.delete(`comments/${commentId}`);
    } catch (err) {
        throw err.response.data;
    }
};
export const voteComment = (commentId, userId, vote) => {
    return APIPrivate.post(`/comments/${commentId}/vote`, null, {
      params: { userId, vote }
    }).catch(err => {
      const errorData = err?.response?.data;
      const rawMessage = errorData && typeof errorData === 'object' && errorData.error
        ? errorData.error
        : err.message || "Unknown error";
  
      const errorMessage = typeof rawMessage === "string"
        ? rawMessage
        : JSON.stringify(rawMessage || {});
  
      console.error("Vote comment error:", errorMessage);
  
      throw new Error(errorMessage);
    });
  };
  
const createReply = async ({commentId,replyData}) => {
    try {
        const response = await APIPrivate.post(`comments/${commentId}/reply`, replyData);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};

export default {
    fetchCommentsByPost,
    fetchAllCommentsByPost,
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    createReply
};