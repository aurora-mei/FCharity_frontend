import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

const persistConfig = {
    key: "root",
    version: 1,
    storage,
};
const reducer = combineReducers(
    {
        auth: authReducer,
    }
)

const persistedAuthReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
    reducer: persistedAuthReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

const persistor = persistStore(store);  // Khởi tạo persistor sau khi store đã được tạo

export { store, persistor };  // Xuất cả store và persistor

export default store;
