import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "./authApi";
import organizationApi from "../organization/organizationApi.js";

const initialState = {
  loading: false,
  newUser: {},
  currentUser: {},
  managedOrganizations: [],
  selectedOrganization: null,
  token: "",
  verified: false,
  backendError: {},
};
export const signUp = createAsyncThunk("auth/signup", async (signupData) => {
  return await authApi.signup(signupData);
});
export const sendOTPCode = createAsyncThunk(
  "auth/sendOTP",
  async (sendOTPData) => {
    return await authApi.sendOTP(sendOTPData);
  }
);
export const verifyEmail = createAsyncThunk(
  "auth/verify",
  async (verifyData) => {
    return await authApi.verify(verifyData);
  }
);
export const logIn = createAsyncThunk("auth/login", async (loginData) => {
  return await authApi.login(loginData);
});

export const logOut = createAsyncThunk("auth/logout", async () => {
  return await authApi.logout();
});

export const getCurrentUser = createAsyncThunk(
  "users/current-user",
  async () => {
    return await authApi.getCurrentUser();
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.newUser = action.payload;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.backendError = action.payload;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.verified = action.payload;
        console.log("Verified:", state.verified);
      })
      .addCase(logIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(logIn.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        console.log("Token state:", state.token);
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        console.error("Error fetching current user:", action.error);
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        console.log("currentUser state: ", state.currentUser);
      })
      .addCase(logOut.fulfilled, (state) => {
        state.token = "";
        state.currentUser = {};
      });
  },
});

export const { setSelectedOrganization } = authSlice.actions;

export default authSlice.reducer;
