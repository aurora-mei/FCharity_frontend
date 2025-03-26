import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { uploadFile } from "./helperApi";

const initialState = {
    loading: false,
}
export const uploadFileHelper = createAsyncThunk("helper/uploadImageHelper", async (file, folderName = "default-folder") => {
    return await uploadFile(file, folderName);
}
);
export const helperSlice = createSlice({
    name: "helper",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(uploadFileHelper.pending, (state) => {
                state.loading = true;
            })
            .addCase(uploadFileHelper.fulfilled, (state) => {
                state.loading = false;
            });
    },
});
export default helperSlice.reducer;