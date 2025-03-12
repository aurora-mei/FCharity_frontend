import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 📌 Gọi API đăng nhập
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post("http://localhost:8080/auth/login", credentials);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// 📌 Gọi API đăng xuất
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    await axios.post("http://localhost:8080/auth/logout");
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
            });
    },
});

export default authSlice.reducer;
