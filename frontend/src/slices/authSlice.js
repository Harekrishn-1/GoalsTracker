import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';

export const registerUser = createAsyncThunk(
    'auth/register',
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await axiosClient.post('/user/register', credentials);
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await axiosClient.post('/user/login', credentials);
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);

// App load pe chalta hai — cookie valid hai ya nahi
export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get('/user/check');
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Not authenticated');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axiosClient.post('/user/logout');
            return null;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Logout failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: true,        // pehle checkAuth complete ho, tab UI dikhao
        error: null,
        authModalOpen: false, // submit dabane pe khulta hai
        authModalMode: 'login'
    },
    reducers: {
        openAuthModal: (state, action) => {
            state.authModalOpen = true;
            state.authModalMode = action.payload || 'login';
            state.error = null;
        },
        closeAuthModal: (state) => {
            state.authModalOpen = false;
            state.error = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        const success = (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.error = null;
            state.authModalOpen = false;
        };

        const failure = (state, action) => {
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
            state.error = action.payload;
        };

        builder
            .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(registerUser.fulfilled, success)
            .addCase(registerUser.rejected, failure)

            .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(loginUser.fulfilled, success)
            .addCase(loginUser.rejected, failure)

            .addCase(checkAuth.pending, (s) => { s.loading = true; })
            .addCase(checkAuth.fulfilled, (s, a) => {
                s.loading = false;
                s.user = a.payload;
                s.isAuthenticated = !!a.payload;
            })
            // checkAuth fail hona normal hai (guest user) — error mat dikhao
            .addCase(checkAuth.rejected, (s) => {
                s.loading = false;
                s.user = null;
                s.isAuthenticated = false;
                s.error = null;
            })

            .addCase(logoutUser.fulfilled, (s) => {
                s.loading = false;
                s.user = null;
                s.isAuthenticated = false;
                s.error = null;
            })
            .addCase(logoutUser.rejected, (s) => {
                s.loading = false;
                s.user = null;
                s.isAuthenticated = false;
            });
    }
});

export const { openAuthModal, closeAuthModal, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
