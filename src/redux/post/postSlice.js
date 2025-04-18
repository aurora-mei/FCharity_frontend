    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
    import postApi from './postApi';

    const initialState = {
        loading: false,
        posts: [],
        currentPost :{},
        error: null,
        recentPosts: [],
        myPosts: []

    };

    export const fetchPosts = createAsyncThunk("posts/fetch", async () => {
        return await postApi.fetchPosts();
    });

    export const fetchTags = createAsyncThunk("tag/fetchTags", async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/api/tags");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
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
    export const votePostThunk = createAsyncThunk(
        "posts/vote",
        async ({ postId, userId, vote }, { rejectWithValue }) => {
            try {
                const result = await postApi.votePost(postId, userId, vote);
                return { postId, vote, totalVote: result.totalVote };
            } catch (error) {
                return rejectWithValue(error.message || "Vote failed");
            }
        }
    );
    export const fetchMyPosts = createAsyncThunk("posts/fetchMyPosts", async (userId) => {
        return await postApi.fetchMyPosts(userId);
    });
    
    const postSlice = createSlice({
        name: 'Post',
        initialState,
        reducers: {
            addToRecentPosts: (state, action) => {
              const post = action.payload;
          
              // Nếu post đã tồn tại thì bỏ ra
              state.recentPosts = state.recentPosts.filter(p => p.post.id !== post.post.id);
          
              // Thêm post mới vào đầu danh sách
              state.recentPosts.unshift(post);
          
              // Giới hạn 10 post gần nhất
              if (state.recentPosts.length > 10) {
                state.recentPosts.pop();
              }
            }
          },          
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
                })
                .addCase(votePostThunk.fulfilled, (state, action) => {
                    console.log("vote res: ",action.payload)
                    const { postId, vote, totalVote } = action.payload;
                    const found = state.posts.find(p => p.post.id === postId);
                    if (found) {
                        found.post.vote = totalVote;
                    }
                    console.log("hhh",postId )
                
                    if (state.currentPost?.post?.id === postId) {
                        state.currentPost.post.vote = totalVote;
                    }
                })
                .addCase(votePostThunk.rejected, (state, action) => {
                    state.error = action.payload;
                })
                .addCase(fetchMyPosts.pending, (state) => {
                    state.loading = true;
                })
                .addCase(fetchMyPosts.fulfilled, (state, action) => {
                    state.loading = false;
                    state.myPosts = action.payload;
                })
                .addCase(fetchMyPosts.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error;
                });
                
                
        },
    });

    export const { addToRecentPosts } = postSlice.actions;
export default postSlice.reducer;