import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import requestApi from './requestApi';

const initialState = {
    loading: false,
    requests: [],
    currentRequest: {},
};

export const fetchRequests = createAsyncThunk("requests/fetch", async () => {
    return await requestApi.fetchRequests();
});

export const createRequest = createAsyncThunk("requests/create", async (requestData) => {
    return await requestApi.createRequest(requestData);
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
                console.error("Error fetching requests:", action.error);
            })
            .addCase(createRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(createRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.requests.push(action.payload);
            })
            .addCase(createRequest.rejected, (state, action) => {
                state.loading = false;
                console.error("Error creating request:", action.error);
            });
    },
});

export default requestSlice.reducer;