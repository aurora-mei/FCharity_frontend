import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 📌 Gọi API lấy danh sách bài viết
export const fetchPosts = createAsyncThunk("post/fetchPosts", async () => {
    const response = await axios.get("http://localhost:8080/posts");
    return response.data;
});

// 📌 Gọi API lấy bài viết theo ID
export const fetchPostById = createAsyncThunk("post/fetchPostById", async (id) => {
    const response = await axios.get(`http://localhost:8080/posts/${id}`);
    return response.data;
});

// 📌 Gọi API tạo bài viết
export const createPost = createAsyncThunk("post/createPost", async (newPost, { rejectWithValue }) => {
    try {
        const response = await axios.post("http://localhost:8080/posts", newPost);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const postSlice = createSlice({
    name: "post",
    initialState: {
        posts: [],
        postDetail: null,
        loading: false,
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.posts = action.payload;
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.postDetail = action.payload;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.posts.push(action.payload);
            });
    },
});

export default postSlice.reducer;
