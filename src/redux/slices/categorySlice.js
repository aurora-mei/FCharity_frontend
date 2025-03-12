import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 📌 Gọi API lấy danh mục
export const fetchCategories = createAsyncThunk("category/fetchCategories", async () => {
    const response = await axios.get("http://localhost:8080/categories");
    return response.data;
});

const categorySlice = createSlice({
    name: "category",
    initialState: {
        categories: [],
        loading: false,
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            });
    },
});

export default categorySlice.reducer;
