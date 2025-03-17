import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "./userApi";

const initialState = {
  loading: false,
  currentUser: {},
  users: [],
  usersOutside: [],
};

export const getAllUsers = createAsyncThunk(
  "users/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching users");
    }
  }
);

export const getAllUsersNotInOrganization = createAsyncThunk(
  "users/getAllUserNotInOrganization",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllUsersNotInOrganization(
        organizationId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching users not in an organization"
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
      // .addCase(getCurrentUser.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(getCurrentUser.rejected, (state, action) => {
      //   state.loading = false;
      //   console.error("Error fetching current user:", action.error);
      // })
      // .addCase(getCurrentUser.fulfilled, (state, action) => {
      //   state.loading = false;
      //   localStorage.setItem("currentUser", action.payload);
      //   console.log("currentUser: ", state.currentUser);
      // })
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
      .addCase(getAllUsersNotInOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.usersOutside = action.payload;
      })
      .addCase(getAllUsersNotInOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllUsersNotInOrganization.pending, (state, action) => {
        state.loading = true;
        state.usersOutside = [];
      });
  },
});

export default userSlice.reducer;
