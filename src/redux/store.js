import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
const reducer = combineReducers(
    {
        auth: authReducer,
    }
)

export const store = configureStore({
    reducer: reducer
});
export default store;
