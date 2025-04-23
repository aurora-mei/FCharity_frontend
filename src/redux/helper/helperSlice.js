import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import helperApi from "./helperApi";

const initialState = {
    loading: false,
    error: null,
    checkoutURL: null,
    listBank: [],
}
export const uploadFileHelper = createAsyncThunk("helper/uploadImageHelper", async ({ file, folderName = "default-folder" }) => {
    return await helperApi.uploadFile({file, folderName});
}
);
export const getPaymentLinkThunk = createAsyncThunk("helper/getPaymentLink", async (data) => {
    return await helperApi.getPaymentLink(data);
}
);
export const uploadFileMedia = createAsyncThunk("helper/uploadFileMedia", async ({ file, folderName = "default-folder", resourceType }) => {
    return await helperApi.uploadFileMedia({ file, folderName, resourceType });
});
export const getListBankThunk = createAsyncThunk("helper/getListBank", async () => {
    return await helperApi.getListBank();
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
            })
            .addCase(uploadFileHelper.rejected, (state,action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(uploadFileMedia.pending, (state) => {
                state.loading = true;
            })
            .addCase(uploadFileMedia.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(uploadFileMedia.rejected, (state,action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(getPaymentLinkThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getPaymentLinkThunk.fulfilled, (state,action) => {
                state.loading = false;
                state.checkoutURL = action.payload;
                console.log("checkout url :", action.payload);
            })
            .addCase(getPaymentLinkThunk.rejected, (state,action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(getListBankThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getListBankThunk.fulfilled, (state,action) => {
                state.loading = false;
                state.listBank = action.payload;
                console.log("getListBankThunk :", action.payload);
            })
            .addCase(getListBankThunk.rejected, (state,action) => {
                state.loading = false;
                state.error = action.error;
            })
            
            ; 
    },
});
export default helperSlice.reducer;