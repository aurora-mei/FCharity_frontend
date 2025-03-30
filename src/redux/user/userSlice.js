import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "./userApi";

const initialState = {
  loading: false,
  error: null,
  currentUser: {},
  users: [],
};
export const getCurrentUser = createAsyncThunk("users/my-profile", async () => {
  return await userApi.getCurrentUser();
});

export const updateProfile = createAsyncThunk(
  "users/update-profile",
  async (profileData) => {
    return await userApi.updateProfile(profileData);
  }
);

export const getAllUsers = createAsyncThunk(
  "users/all",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error get users outside an organization"
      );
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
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
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        localStorage.setItem("currentUser", JSON.stringify(action.payload));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state, action) => {
        state.loading = true;
        state.users = [];
      });
  },
});

export default userSlice.reducer;
