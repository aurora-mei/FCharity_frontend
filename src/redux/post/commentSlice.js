import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentApi from './commentApi';

const initialState = {
    comments: [],
    loading: false,
    error: null,
    hasMore: true,
    currentPage: 0,
};

// Fetch comments by post (pagination)
export const fetchCommentsByPost = createAsyncThunk(
    "comments/fetchByPost",
    async ({ postId, page = 0, size = 5 }) => {
        const response = await commentApi.fetchCommentsByPost(postId, page, size);
        return { 
            comments: response, 
            page, 
            hasMore: response.length >= size
        };
    }
);

// Create new comment
export const createComment = createAsyncThunk(
    "comments/create",
    async (commentData) => {
        const response = await commentApi.createComment(commentData);
        return response;
    }
);

// Update comment
export const updateComment = createAsyncThunk(
    "comments/update",
    async ({ commentId, commentData }, { rejectWithValue }) => {
        try {
            const response = await commentApi.updateComment(commentId, commentData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete comment
export const deleteComment = createAsyncThunk(
    "comments/delete",
    async (commentId, { rejectWithValue }) => {
        try {
            await commentApi.deleteComment(commentId);
            return commentId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Vote comment
export const voteComment = createAsyncThunk(
    "comments/vote",
    async ({ commentId, userId, isUpvote }, { rejectWithValue }) => {
        try {
            const response = await commentApi.voteComment(commentId, userId, isUpvote);
            return response.data; // { commentId, upvotes, downvotes }
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi không xác định");
        }
    }
);

// Create reply
export const createReply = createAsyncThunk(
    "comments/createReply",
    async ({ commentId, replyData }, { rejectWithValue }) => {
        try {
            const response = await commentApi.createReply({ commentId, replyData });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch comments
            .addCase(fetchCommentsByPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCommentsByPost.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.page === 0) {
                    state.comments = action.payload.comments;
                } else {
                    state.comments = [...state.comments, ...action.payload.comments];
                }
                state.hasMore = action.payload.hasMore;
                state.currentPage = action.payload.page;
            })
            .addCase(fetchCommentsByPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create comment
            .addCase(createComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments.unshift(action.payload);
            })
            .addCase(createComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update comment
            .addCase(updateComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.comments.findIndex(
                    c => c.commentId === action.payload.commentId
                );
                if (index !== -1) state.comments[index] = action.payload;
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete comment
            .addCase(deleteComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = state.comments.filter(
                    c => c.commentId !== action.payload
                );
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Vote comment
            .addCase(voteComment.fulfilled, (state, action) => {
                const { commentId, totalVote } = action.payload;
                const comment = state.comments.find(c => c.comment.commentId === commentId);
                if (comment) {
                  comment.comment.vote = totalVote;
                }
              })
            
            .addCase(voteComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Vote failed";
            })

            // Create reply
            .addCase(createReply.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReply.fulfilled, (state, action) => {
                state.loading = false;
                const parent = state.comments.find(
                    c => c.commentId === action.payload.parentCommentId
                );
                if (parent) {
                    parent.replies = parent.replies || [];
                    parent.replies.push(action.payload);
                }
            })
            .addCase(createReply.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = commentSlice.actions;
export default commentSlice.reducer;