import { useEffect } from 'react';
import { Routes, Route } from 'react-router';
import { useDispatch } from 'react-redux';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import GoalsPage from './pages/GoalsPage';
import AdminPage from './pages/AdminPage';

import { checkAuth } from './slices/authSlice';

export default function App() {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(checkAuth()); }, [dispatch]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
                <Route path="/" element={<GoalsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<GoalsPage />} />
            </Routes>
            <AuthModal />
        </div>
    );
}
