import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "./userApi";

const initialState = {
  loading: false,
  error: null,
  currentUser: {},
  currentBalance: 0,
  users: [],
  transactionHistory: [],
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
export const getTransactionHistoryOfUser = createAsyncThunk(
  "users/transaction-history",
  async (userId) => {
    return await userApi.getTransactionHistoryOfUser(userId);
  }
);
export const getCurrentWalletThunk = createAsyncThunk(
  "users/current-wallet",
  async () => {
    return await userApi.getCurrentWallet();
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
      })
      .addCase(getTransactionHistoryOfUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTransactionHistoryOfUser.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionHistory = action.payload;
      })
      .addCase(getTransactionHistoryOfUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCurrentWalletThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentWalletThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBalance = action.payload.balance;
      })
      .addCase(getCurrentWalletThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      ;
  },
});

export default userSlice.reducer;
