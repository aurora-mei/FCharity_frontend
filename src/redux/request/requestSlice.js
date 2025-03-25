import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import requestApi from './requestApi';

const initialState = {
    loading: false,
    requests: [],
    activeRequests: [],
    currentRequest: {},
    requestsByUserId: [],
    error: null,
};

export const fetchRequests = createAsyncThunk("requests/fetch", async () => {
    return await requestApi.fetchRequests();
});

export const fetchActiveRequests = createAsyncThunk("requests/fetchActive", async () => {
    return await requestApi.fetchActiveRequests();
});

export const fetchRequestById = createAsyncThunk("requests/fetchById", async (id) => {
    return await requestApi.fetchRequestById(id);
});

export const createRequest = createAsyncThunk("requests/create", async (requestData) => {
    return await requestApi.createRequest(requestData);
});

export const updateRequest = createAsyncThunk("requests/update", async ({ id, requestData }) => {
    return await requestApi.updateRequest(id, requestData);
});

export const deleteRequest = createAsyncThunk("requests/delete", async (id) => {
    await requestApi.deleteRequest(id);
    return id;
});

// Thunk mới để lấy requests theo userId
export const fetchRequestsByUserIdThunk = createAsyncThunk(
    "requests/fetchByUserId",
    async (userId) => {
        return await requestApi.fetchRequestsByUserId(userId);
    });

const requestSlice = createSlice({
    name: 'request',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchActiveRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchActiveRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.activeRequests = action.payload;
            })
            .addCase(fetchActiveRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(fetchRequestById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRequestById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRequest = action.payload;
            })
            .addCase(fetchRequestById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(createRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(createRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.requests.push(action.payload);
                state.requestsByUserId.push(action.payload);
            })
            .addCase(createRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(updateRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.requestsByUserId = state.requestsByUserId.map(req =>
                    req.helpRequest.id === action.payload.helpRequest.id ? action.payload : req
                );
                state.currentRequest = action.payload;
            })
            .addCase(updateRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            .addCase(deleteRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = state.requests.filter(helpRequest => helpRequest.id !== action.payload);
            })
            .addCase(deleteRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error;
            })
            // Xử lý thunk fetchRequestsByUserId
            .addCase(fetchRequestsByUserIdThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRequestsByUserIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.requestsByUserId = action.payload;
            })
            .addCase(fetchRequestsByUserIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error;
            });
    },
});

export default requestSlice.reducer;