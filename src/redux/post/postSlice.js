    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
    import postApi from './postApi';
    const initialState = {
        loading: false,
        posts: [],
        currentPost :{},
        error: null,
        recentPosts: [],
        myPosts: [],
        topVoted: [],
    };
    export const fetchTopVotedPosts = createAsyncThunk("posts/top-voted", async (limit = 2) => {
        return await postApi.fetchTopVotedPosts(limit);
    });
    
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

    export const deletePosts = createAsyncThunk(
        'posts/deletePost',
        async (postId, { rejectWithValue }) => {
            try {
                await postApi.deletePost(postId);
                return postId;
            } catch (error) {
                // Return the actual error message from the API
                return rejectWithValue(error.message || "Failed to delete post");
            }
        }
    );
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
    export const reportPostThunk = createAsyncThunk(
        "posts/report",
        async ({ postId, reporterId, reason }, { rejectWithValue }) => {
          try {
            return await postApi.reportPost(postId, reporterId, reason);
          } catch (error) {
            return rejectWithValue(error.message);
          }
        }
      );
      export const hidePostThunk = createAsyncThunk(
        "posts/hide",
        async ({ postId, userId }, { rejectWithValue }) => {
          try {
            return await postApi.hidePost(postId, userId);
          } catch (error) {
            return rejectWithValue(error.message);
          }
        }
      );
      
// postSlice.js
export const unhidePostThunk = createAsyncThunk(
    'post/unhidePost',
    async ({ postId, userId }, { rejectWithValue }) => {
      try {
        const response = await api.put(`/posts/${postId}/unhide`, { 
          status: 'APPROVED' // Thêm trường status
        });
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response.data);
      }
    }
  );
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
                    state.error = null;
                })
                .addCase(updatePosts.fulfilled, (state, action) => {
                    state.loading = false;
                    const updatedPost = action.payload;
                    
                    // Cập nhật posts list
                    state.posts = state.posts.map(post => 
                        post.post.id === updatedPost.post.id ? updatedPost : post
                    );
                    
                    // Cập nhật myPosts nếu có
                    state.myPosts = state.myPosts.map(post => 
                        post.post.id === updatedPost.post.id ? updatedPost : post
                    );
                    
                    // Cập nhật current post
                    state.currentPost = updatedPost;
                })
                .addCase(updatePosts.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
                })
                .addCase(deletePosts.pending, (state) => {
                    state.loading = true;
                  })
                  .addCase(deletePosts.fulfilled, (state, action) => {
                    state.posts = state.posts.filter(p => p.post.id !== action.payload);
                    state.myPosts = state.myPosts.filter(p => p.post.id !== action.payload);
                    state.loading = false;
                  })
                  .addCase(deletePosts.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                    console.error("Delete error:", action.payload);
                })
                  .addCase(votePostThunk.fulfilled, (state, action) => {
                    const { postId, vote, totalVote } = action.payload;
                    const found = state.posts.find(p => p.post.id === postId);
                    if (found) {
                        found.post.vote = totalVote;
                    }
                
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
                })
                .addCase(fetchTopVotedPosts.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(fetchTopVotedPosts.fulfilled, (state, action) => {
                    state.loading = false;
                    state.topVoted = action.payload;
                })
                .addCase(fetchTopVotedPosts.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }).addCase(reportPostThunk.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                  })
                  .addCase(reportPostThunk.fulfilled, (state) => {
                    state.loading = false;
                  })
                  .addCase(reportPostThunk.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                  })
                  .addCase(hidePostThunk.fulfilled, (state, action) => {
                    const updatedPost = action.payload;
                    state.posts = state.posts.map(post => 
                      post.post.id === updatedPost.post.id ? updatedPost : post
                    );
                    state.myPosts = state.myPosts.map(post => 
                      post.post.id === updatedPost.post.id ? updatedPost : post
                    );
                  })
                  .addCase(unhidePostThunk.fulfilled, (state, action) => {
                    const updatedPost = action.payload;
                    state.posts = state.posts.map(post => 
                      post.post.id === updatedPost.post.id ? updatedPost : post
                    );
                    state.myPosts = state.myPosts.map(post => 
                      post.post.id === updatedPost.post.id ? updatedPost : post
                    );
                  });
                  
                
        },
    });

    export const { addToRecentPosts } = postSlice.actions;
export default postSlice.reducer;