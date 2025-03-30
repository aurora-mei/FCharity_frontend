import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import requestReducer from './request/requestSlice';
import categoryReducer from './category/categorySlice';
import tagReducer from './tag/tagSlice';
import helperReducer from './helper/helperSlice';
import postReducer from './post/postSlice';
import userReducer from './user/userSlice';
import organizationReducer from './organization/organizationSlice';
import projectReducer from './project/projectSlice';
const reducer = combineReducers({
    auth: authReducer,
    request: requestReducer,
    category: categoryReducer,
    tag: tagReducer,
    helper: helperReducer,
    post: postReducer,
    user: userReducer,
    organization: organizationReducer,
    project: projectReducer,
});

export const store = configureStore({
    reducer: reducer,
});

export default store;