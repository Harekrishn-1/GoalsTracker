import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';
import {
    guestGetGoals, guestCreateGoal, guestUpdateGoal,
    guestDeleteGoal, guestCopyGoals, guestSubmitDay
} from '../utils/guestStorage';
import { Goal, CreateGoalPayload, EditGoalPayload, CopyGoalsPayload } from '../types';
import { RootState } from '../store/store';
import axios from 'axios';

type FetchGoalsArg = string | { all?: boolean } | null | undefined;

export const fetchGoals = createAsyncThunk<
    { data: Goal[]; all: boolean },
    FetchGoalsArg,
    { state: RootState; rejectValue: string }
>(
    'goals/fetch',
    async (arg, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        const all = typeof arg === 'object' && arg !== null && !!arg.all;
        const date = all ? undefined : (typeof arg === 'string' ? arg : undefined);

        if (!isAuthenticated) {
            return { data: guestGetGoals(date), all };
        }

        try {
            const res = await axiosClient.get('/goal', { params: date ? { date } : {} });
            return { data: res.data, all };
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not load goals');
            }
            return rejectWithValue('Could not load goals');
        }
    }
);

export const addGoal = createAsyncThunk<
    Goal,
    CreateGoalPayload,
    { state: RootState; rejectValue: string }
>(
    'goals/add',
    async (payload, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) return guestCreateGoal(payload);

        try {
            const res = await axiosClient.post('/goal', payload);
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not add goal');
            }
            return rejectWithValue('Could not add goal');
        }
    }
);

export const editGoal = createAsyncThunk<
    Goal,
    EditGoalPayload,
    { state: RootState; rejectValue: string }
>(
    'goals/edit',
    async ({ id, updates }, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) {
            const updated = guestUpdateGoal(id, updates);
            if (!updated) return rejectWithValue('Goal not found');
            return updated;
        }

        try {
            const res = await axiosClient.patch(`/goal/${id}`, updates);
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not update goal');
            }
            return rejectWithValue('Could not update goal');
        }
    }
);

export const removeGoal = createAsyncThunk<
    string,
    string,
    { state: RootState; rejectValue: string }
>(
    'goals/remove',
    async (id, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) {
            guestDeleteGoal(id);
            return id;
        }

        try {
            await axiosClient.delete(`/goal/${id}`);
            return id;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not delete goal');
            }
            return rejectWithValue('Could not delete goal');
        }
    }
);

// Submit ke liye login zaroori hai — guest ke case mein component modal kholta hai
export const submitDay = createAsyncThunk<
    Goal[],
    string,
    { state: RootState; rejectValue: string }
>(
    'goals/submit',
    async (date, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) return guestSubmitDay(date);

        try {
            const res = await axiosClient.post('/goal/submit', { date });
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not submit');
            }
            return rejectWithValue('Could not submit');
        }
    }
);

export const copyGoals = createAsyncThunk<
    Goal[],
    CopyGoalsPayload,
    { state: RootState; rejectValue: string }
>(
    'goals/copy',
    async ({ fromDate, toDate, goalIds }, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) return guestCopyGoals(fromDate, toDate, goalIds);

        try {
            const res = await axiosClient.post('/goal/copy', { fromDate, toDate, goalIds });
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data?.message || 'Could not copy goals');
            }
            return rejectWithValue('Could not copy goals');
        }
    }
);

export interface GoalState {
    items: Goal[];
    allItems: Goal[];
    loading: boolean;
    error: string | null;
    selectedDate: string | null;
}

const initialState: GoalState = {
    items: [],
    allItems: [],
    loading: false,
    error: null,
    selectedDate: null
};

const goalSlice = createSlice({
    name: 'goals',
    initialState,
    reducers: {
        setSelectedDate: (state, action: PayloadAction<string | null>) => {
            state.selectedDate = action.payload;
        },
        clearGoalError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGoals.pending, (s, a) => {
                const isAll = typeof a.meta.arg === 'object' && a.meta.arg !== null && !!a.meta.arg.all;
                if (!isAll) {
                    s.loading = true;
                    s.error = null;
                }
            })
            .addCase(fetchGoals.fulfilled, (s, a) => {
                const { data, all } = a.payload || {};
                if (all) {
                    s.allItems = data || [];
                } else {
                    s.loading = false;
                    s.items = data || [];
                }
            })
            .addCase(fetchGoals.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload || 'Failed to load goals';
            })

            .addCase(addGoal.fulfilled, (s, a) => {
                if (a.payload) {
                    s.items.push(a.payload);
                    s.allItems.push(a.payload);
                }
            })
            .addCase(addGoal.rejected, (s, a) => {
                s.error = a.payload || 'Failed to add goal';
            })

            .addCase(editGoal.fulfilled, (s, a) => {
                if (!a.payload) return;
                const i = s.items.findIndex((g) => g._id === a.payload._id);
                if (i !== -1) s.items[i] = a.payload;
                const j = s.allItems.findIndex((g) => g._id === a.payload._id);
                if (j !== -1) s.allItems[j] = a.payload;
            })

            .addCase(removeGoal.fulfilled, (s, a) => {
                s.items = s.items.filter((g) => g._id !== a.payload);
                s.allItems = s.allItems.filter((g) => g._id !== a.payload);
            })

            .addCase(submitDay.fulfilled, (s, a) => {
                const updated = a.payload || [];
                s.items = updated;
                for (const g of updated) {
                    const j = s.allItems.findIndex((x) => x._id === g._id);
                    if (j !== -1) s.allItems[j] = g;
                }
            })
            .addCase(submitDay.rejected, (s, a) => {
                s.error = a.payload || 'Failed to submit goals';
            })

            .addCase(copyGoals.fulfilled, (s, a) => {
                const copies = a.payload || [];
                for (const c of copies) {
                    s.allItems.push(c);
                    if (c.date === s.selectedDate) s.items.push(c);
                }
            });
    }
});

export const { setSelectedDate, clearGoalError } = goalSlice.actions;
export default goalSlice.reducer;
