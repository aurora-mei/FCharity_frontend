import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryApi from './categoryApi';

const initialState = {
    loading: false,
    categories: [],
};

export const fetchCategories = createAsyncThunk("categories/fetch", async () => {
    return await categoryApi.fetchCategories();
});

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                console.error("Error fetching categories:", action.error);
            });
    },
});

export default categorySlice.reducer;