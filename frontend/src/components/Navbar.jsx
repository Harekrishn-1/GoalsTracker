import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router';
import { Target, LogOut, ShieldCheck } from 'lucide-react';
import { openAuthModal, logoutUser } from '../slices/authSlice';
import { fetchGoals } from '../slices/goalSlice';

export default function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((s) => s.auth);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        dispatch(fetchGoals(null));
        navigate('/');
    };

    return (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto md:px-8">
                <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-green-600 to-blue-600">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    GoalsTracker
                </NavLink>

                <div className="flex items-center gap-2">
                    {isAuthenticated && user?.role === 'admin' && (
                        <NavLink to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }>
                            <ShieldCheck className="w-4 h-4" /> Admin
                        </NavLink>
                    )}

                    {isAuthenticated ? (
                        <>
                            <span className="hidden text-sm text-gray-600 sm:inline">Hi, {user?.firstName}</span>
                            <button onClick={handleLogout}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => dispatch(openAuthModal('login'))}
                                className="px-3 py-2 text-sm text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                                Log in
                            </button>
                            <button onClick={() => dispatch(openAuthModal('signup'))}
                                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600">
                                Sign up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
