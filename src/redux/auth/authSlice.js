import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from './authApi';

const initialState = {
  loading: false,
  newUser: {},
  currentUser: localStorage.getItem("currentUser")
    ? JSON.parse(localStorage.getItem("currentUser"))
    : {},
  token: localStorage.getItem("token") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
  verified: false,
  canResetPwd: false,
  error: null,
};

export const signUp = createAsyncThunk("auth/signup", async (signupData) => {
  return await authApi.signup(signupData);
});
export const sendOTPCode = createAsyncThunk("auth/sendOTP", async (sendOTPData) => {
  return await authApi.sendOTP(sendOTPData);
});
export const verifyEmail = createAsyncThunk("auth/verify", async (verifyData) => {
  return await authApi.verify(verifyData);
});
export const sendResetPasswordOTPCode = createAsyncThunk(
  "auth/sendResetPasswordOTP",
  async (sendOTPData) => {
    return await authApi.sendResetPasswordOTP(sendOTPData);
  }
);
export const verifyResetPasswordOTPCode = createAsyncThunk(
  "auth/verifyResetPasswordOTP",
  async (verifyData) => {
    return await authApi.verifyResetPasswordOTP(verifyData);
  }
);
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData) => {
    return await authApi.resetPassword(resetData);
  }
);
export const logIn = createAsyncThunk("auth/login", async (loginData) => {
  return await authApi.login(loginData);
});
export const logOut = createAsyncThunk("auth/logout", () => {});
export const getCurrentUser = createAsyncThunk("users/current-user", async () => {
  return await authApi.getCurrentUser();
});
export const googleLogIn = createAsyncThunk("auth/googleLogin", async (token) => {
  return await authApi.googleLogin(token);
});
export const changePassword = createAsyncThunk("auth/changePassword", async (changePasswordData) => {
  return await authApi.changePassword(changePasswordData);
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Other reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.newUser = action.payload;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      })
      .addCase(sendResetPasswordOTPCode.pending, (state) => {
        state.loading = true;
        state.verified = false;
      })
      .addCase(sendResetPasswordOTPCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
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
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('token', state.token);
        localStorage.setItem('refreshToken', state.refreshToken);
      })
      .addCase(logIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        console.log("currentUser state: ", state.currentUser);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        console.error("Error fetching current user:", action.error);
      })
      .addCase(logOut.fulfilled, (state) => {
        state.token = "";
        state.currentUser = {};
        state.newUser = {};
        state.verified = false;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      })
      .addCase(verifyResetPasswordOTPCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyResetPasswordOTPCode.fulfilled, (state, action) => {
        state.loading = false;
        state.canResetPwd = action.payload;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.canResetPwd = false;
      })
      .addCase(googleLogIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogIn.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('token', state.token);
        localStorage.setItem('refreshToken', state.refreshToken);
        console.log("Google login token state:", state.refreshToken);
        console.log("Google login token state:", state.token);
      })
      .addCase(googleLogIn.rejected, (state, action) => {
        state.loading = false;
        state.backendError = action.payload;
        console.error("Google login error:", action.payload);
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.error;
        }
      );
  },
});

export default authSlice.reducer;
