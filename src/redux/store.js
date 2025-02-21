import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import requestReducer from './request/requestSlice';
import categoryReducer from './category/categorySlice';
import tagReducer from './tag/tagSlice';

const reducer = combineReducers({
    auth: authReducer,
    request: requestReducer,
    category: categoryReducer,
    tag: tagReducer,
});

export const store = configureStore({
    reducer: reducer,
});

export default store;