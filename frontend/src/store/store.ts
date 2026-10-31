import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import goalReducer from '../slices/goalSlice';
import adminReducer from '../slices/adminSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        goals: goalReducer,
        admin: adminReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
