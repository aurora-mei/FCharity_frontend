import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from './userApi';

const initialState = {
  loading: false,
  currentUser: {},
  error: null,
};

export const getCurrentUser = createAsyncThunk("users/my-profile", async () => {
  return await userApi.getCurrentUser();
});

export const updateProfile = createAsyncThunk("users/update-profile", async (profileData) => {
  return await userApi.updateProfile(profileData);
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Các reducer khác nếu cần
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        localStorage.setItem("currentUser", JSON.stringify(action.payload));
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
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
      });
  },
});

export default userSlice.reducer;
