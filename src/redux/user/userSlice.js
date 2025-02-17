import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userApi from './userApi'

const initialState = {
    loading: false,
    currentUser: {},
}
export const getCurrentUser = createAsyncThunk("users/current-user", async () => {
    return await userApi.getCurrentUser();
});

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                console.error("Error fetching current user:", action.error);
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                localStorage.setItem("currentUser", action.payload);
                console.log("currentUser: ", state.currentUser);
            })
            ;
    },
})

export default userSlice.reducer;