import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postApi from './postApi';

const initialState = {
    loading: false,
    posts: [],
    currentPost :{},
    error: null,
};

export const fetchPosts = createAsyncThunk("posts/fetch", async () => {
    return await postApi.fetchPosts();
});


export const fetchPostsById = createAsyncThunk("posts/fetchById", async (id) => {
    return await postApi.fetchPostById(id);
});

export const createPosts = createAsyncThunk("posts/create", async (postData) => {
    return await postApi.createPost(postData);
});

export const updatePosts = createAsyncThunk("posts/update", async ({ id, PostData }) => {
    return await postApi.updatePost(id, PostData);
});

export const deletePosts = createAsyncThunk("posts/delete", async (id) => {
    await postApi.deletePost(id);
    return id;
});

const postSlice = createSlice({
    name: 'Post',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            
            .addCase(fetchPostsById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPostsById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPost = action.payload;
            })
            .addCase(fetchPostsById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(createPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(createPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts.push(action.payload);
            })
            .addCase(createPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(updatePosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePosts.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.posts.findIndex(Post => Post.Post.id === action.payload.Post.id);
                if (index !== -1) {
                    state.posts[index] = action.payload;
                }
                state.currentPost = action.payload;
            })
            .addCase(updatePosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(deletePosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = state.posts.filter(Post => Post.id !== action.payload);
            })
            .addCase(deletePosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            });
    },
});

export default postSlice.reducer;