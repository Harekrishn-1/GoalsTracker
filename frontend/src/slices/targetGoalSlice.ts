import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';
import {
    guestGetTargetGoals,
    guestCreateTargetGoal,
    guestUpdateTargetGoal,
    guestDeleteTargetGoal
} from '../utils/guestStorage';
import { TargetGoal, CreateTargetGoalPayload, UpdateTargetGoalPayload } from '../types';
import { RootState } from '../store/store';
import axios from 'axios';

export const fetchTargetGoals = createAsyncThunk<
    TargetGoal[],
    void,
    { state: RootState; rejectValue: string }
>(
    'targetGoals/fetch',
    async (_, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;

        if (!isAuthenticated) {
            return guestGetTargetGoals();
        }

        try {
            const res = await axiosClient.get('/target-goal');
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not load target goals');
            }
            return rejectWithValue('Could not load target goals');
        }
    }
);

export const addTargetGoal = createAsyncThunk<
    TargetGoal,
    CreateTargetGoalPayload,
    { state: RootState; rejectValue: string }
>(
    'targetGoals/add',
    async (payload, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;

        if (!isAuthenticated) {
            return guestCreateTargetGoal(payload);
        }

        try {
            const res = await axiosClient.post('/target-goal', payload);
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not add target goal');
            }
            return rejectWithValue('Could not add target goal');
        }
    }
);

export const editTargetGoal = createAsyncThunk<
    TargetGoal,
    UpdateTargetGoalPayload,
    { state: RootState; rejectValue: string }
>(
    'targetGoals/edit',
    async ({ id, updates }, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;

        if (!isAuthenticated) {
            const updated = guestUpdateTargetGoal(id, updates);
            if (!updated) return rejectWithValue('Target goal not found');
            return updated;
        }

        try {
            const res = await axiosClient.patch(`/target-goal/${id}`, updates);
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not update target goal');
            }
            return rejectWithValue('Could not update target goal');
        }
    }
);

export const removeTargetGoal = createAsyncThunk<
    string,
    string,
    { state: RootState; rejectValue: string }
>(
    'targetGoals/remove',
    async (id, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;

        if (!isAuthenticated) {
            guestDeleteTargetGoal(id);
            return id;
        }

        try {
            await axiosClient.delete(`/target-goal/${id}`);
            return id;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not delete target goal');
            }
            return rejectWithValue('Could not delete target goal');
        }
    }
);

export interface TargetGoalState {
    items: TargetGoal[];
    loading: boolean;
    error: string | null;
}

const initialState: TargetGoalState = {
    items: [],
    loading: false,
    error: null
};

const targetGoalSlice = createSlice({
    name: 'targetGoals',
    initialState,
    reducers: {
        clearTargetError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTargetGoals.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchTargetGoals.fulfilled, (s, a) => {
                s.loading = false;
                s.items = a.payload || [];
            })
            .addCase(fetchTargetGoals.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload || 'Failed to load target goals';
            })

            .addCase(addTargetGoal.fulfilled, (s, a) => {
                if (a.payload) {
                    s.items.unshift(a.payload);
                }
            })
            .addCase(addTargetGoal.rejected, (s, a) => {
                s.error = a.payload || 'Failed to add target goal';
            })

            .addCase(editTargetGoal.fulfilled, (s, a) => {
                if (!a.payload) return;
                const idx = s.items.findIndex((t) => t._id === a.payload._id);
                if (idx !== -1) {
                    s.items[idx] = a.payload;
                }
            })

            .addCase(removeTargetGoal.fulfilled, (s, a) => {
                s.items = s.items.filter((t) => t._id !== a.payload);
            });
    }
});

export const { clearTargetError } = targetGoalSlice.actions;
export default targetGoalSlice.reducer;
