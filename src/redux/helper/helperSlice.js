import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { uploadImage } from "./helperApi";

const initialState = {
    loading: false,
}
export const uploadImageBook = createAsyncThunk("helper/uploadImage", async (file) => {
    return await uploadImage(file);
}
);
export const helperSlice = createSlice({
    name: "helper",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(uploadImageBook.pending, (state) => {
                state.loading = true;
            })
            .addCase(uploadImageBook.fulfilled, (state) => {
                state.loading = false;
            });
    },
});
export default helperSlice.reducer;