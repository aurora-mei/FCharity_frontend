import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tagApi from './tagApi';

const initialState = {
    loading: false,
    tags: [],
};

export const fetchTags = createAsyncThunk("tags/fetch", async () => {
    return await tagApi.fetchTags();
});

const tagSlice = createSlice({
    name: 'tag',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTags.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTags.fulfilled, (state, action) => {
                state.loading = false;
                state.tags = action.payload;
            })
            .addCase(fetchTags.rejected, (state, action) => {
                state.loading = false;
                console.error("Error fetching tags:", action.error);
            });
    },
});

export default tagSlice.reducer;