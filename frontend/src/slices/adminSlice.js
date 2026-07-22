import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';

export const fetchAdminStats = createAsyncThunk(
    'admin/stats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get('/admin/stats');
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Could not load stats');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState: { stats: null, loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminStats.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchAdminStats.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload; })
            .addCase(fetchAdminStats.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    }
});

export default adminSlice.reducer;
