import { APIPrivate } from '../../config/API/api';

const fetchCommentsByPost = async (postId, page = 0, size = 5) => {
    try {
        const response = await APIPrivate.get(`comments/post/${postId}`, {
            params: { page, size }
        });
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
      const errorMessage = err.response?.data?.error || err.message || "Unknown error";
      console.error("Vote comment error:", errorMessage);
      throw new Error(errorMessage); // Ném một Error với thông điệp rõ ràng
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
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    createReply
};