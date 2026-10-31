import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';
import { AdminStats } from '../types';
import axios from 'axios';

export const fetchAdminStats = createAsyncThunk<AdminStats, void, { rejectValue: string }>(
    'admin/stats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get('/admin/stats');
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not load stats');
            }
            return rejectWithValue('Could not load stats');
        }
    }
);

export interface AdminState {
    stats: AdminStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    stats: null,
    loading: false,
    error: null
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminStats.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchAdminStats.fulfilled, (s, a) => {
                s.loading = false;
                s.stats = a.payload;
            })
            .addCase(fetchAdminStats.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload || 'Failed to load stats';
            });
    }
});

export default adminSlice.reducer;
