import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 📌 Gọi API lấy danh sách tag
export const fetchTags = createAsyncThunk("tag/fetchTags", async () => {
    const response = await axios.get("http://localhost:8080/tags");
    return response.data;
});

const tagSlice = createSlice({
    name: "tag",
    initialState: {
        tags: [],
        loading: false,
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchTags.fulfilled, (state, action) => {
                state.tags = action.payload;
            });
    },
});

export default tagSlice.reducer;
