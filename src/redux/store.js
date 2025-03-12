import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import userReducer from "./user/userSlice";
import organizationReducer from "./organization/organizationSlice";
import requestReducer from "./request/requestSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    organizations: organizationReducer,
    requests: requestReducer,
  },
});

export default store;
