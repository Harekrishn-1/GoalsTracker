import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';
import {
    guestGetGoals, guestCreateGoal, guestUpdateGoal,
    guestDeleteGoal, guestCopyGoals, guestSubmitDay
} from '../utils/guestStorage';

// Har thunk pehle auth state dekhta hai — logged in ho to API, warna localStorage.
// Isse component ko farq nahi padta ki user guest hai ya nahi.

// arg: 'YYYY-MM-DD' ek din ke liye, ya { all: true } calendar ke liye
export const fetchGoals = createAsyncThunk(
    'goals/fetch',
    async (arg, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        const all = arg && typeof arg === 'object' && arg.all;
        const date = all ? undefined : arg;

        if (!isAuthenticated)
            return { data: guestGetGoals(date), all: !!all };

        try {
            const res = await axiosClient.get('/goal', { params: date ? { date } : {} });
            return { data: res.data, all: !!all };
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Could not load goals');
        }
    }
);

export const addGoal = createAsyncThunk(
    'goals/add',
    async (payload, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) return guestCreateGoal(payload);

        try {
            const res = await axiosClient.post('/goal', payload);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Could not add goal');
        }
    }
);

export const editGoal = createAsyncThunk(
    'goals/edit',
    async ({ id, updates }, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) return guestUpdateGoal(id, updates);

        try {
            const res = await axiosClient.patch(`/goal/${id}`, updates);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Could not update goal');
        }
    }
);

export const removeGoal = createAsyncThunk(
    'goals/remove',
    async (id, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) { guestDeleteGoal(id); return id; }

        try {
            await axiosClient.delete(`/goal/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Could not delete goal');
        }
    }
);

// Submit ke liye login zaroori hai — guest ke case mein component modal kholta hai
export const submitDay = createAsyncThunk(
    'goals/submit',
    async (date, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) return guestSubmitDay(date);

        try {
            const res = await axiosClient.post('/goal/submit', { date });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Could not submit');
        }
    }
);

export const copyGoals = createAsyncThunk(
    'goals/copy',
    async ({ fromDate, toDate, goalIds }, { getState, rejectWithValue }) => {
        const { isAuthenticated } = getState().auth;
        if (!isAuthenticated) return guestCopyGoals(fromDate, toDate, goalIds);

        try {
            const res = await axiosClient.post('/goal/copy', { fromDate, toDate, goalIds });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Could not copy goals');
        }
    }
);

const goalSlice = createSlice({
    name: 'goals',
    initialState: {
        items: [],       // current date ke goals
        allItems: [],    // calendar ke liye saare goals
        loading: false,
        error: null,
        selectedDate: null
    },
    reducers: {
        setSelectedDate: (state, action) => { state.selectedDate = action.payload; },
        clearGoalError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGoals.pending, (s, a) => {
                if (!a.meta.arg?.all) { s.loading = true; s.error = null; }
            })
            .addCase(fetchGoals.fulfilled, (s, a) => {
                const { data, all } = a.payload || {};
                if (all) s.allItems = data || [];
                else { s.loading = false; s.items = data || []; }
            })
            .addCase(fetchGoals.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

            .addCase(addGoal.fulfilled, (s, a) => {
                if (a.payload) { s.items.push(a.payload); s.allItems.push(a.payload); }
            })
            .addCase(addGoal.rejected, (s, a) => { s.error = a.payload; })

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
            .addCase(submitDay.rejected, (s, a) => { s.error = a.payload; })

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
