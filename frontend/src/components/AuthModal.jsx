import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { X, Loader2, AlertCircle } from 'lucide-react';

import { loginUser, registerUser, closeAuthModal, clearAuthError } from '../slices/authSlice';
import { migrateGuestData } from '../utils/migrate';
import { fetchGoals } from '../slices/goalSlice';

export default function AuthModal() {
    const dispatch = useDispatch();
    const { authModalOpen, authModalMode, loading, error, isAuthenticated } = useSelector((s) => s.auth);
    const { selectedDate } = useSelector((s) => s.goals);

    const [mode, setMode] = useState(authModalMode);
    const [migrating, setMigrating] = useState(false);

    useEffect(() => { setMode(authModalMode); }, [authModalMode]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => { reset(); dispatch(clearAuthError()); }, [mode, reset, dispatch]);

    useEffect(() => {
        if (!isAuthenticated || !authModalOpen) return;
        (async () => {
            setMigrating(true);
            await migrateGuestData();
            await dispatch(fetchGoals(selectedDate));
            await dispatch(fetchGoals({ all: true }));
            setMigrating(false);
            dispatch(closeAuthModal());
        })();
    }, [isAuthenticated, authModalOpen, dispatch, selectedDate]);

    if (!authModalOpen) return null;

    const onSubmit = (data) => {
        if (mode === 'login') dispatch(loginUser(data));
        else dispatch(registerUser(data));
    };

    const busy = loading || migrating;
    const inputClass = "w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
                <div className="flex items-start justify-between mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </h2>
                    <button onClick={() => dispatch(closeAuthModal())}
                        className="p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="mb-6 text-sm text-gray-500">Your goals are saved once you sign in.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    {mode === 'signup' && (
                        <input {...register('firstName', { required: 'Name is required' })}
                            placeholder="First name" className={inputClass} />
                    )}
                    <input {...register('emailId', { required: 'Email is required' })}
                        type="email" placeholder="Email" className={inputClass} />
                    <input {...register('password', { required: 'Password is required' })}
                        type="password" placeholder="Password" className={inputClass} />

                    {(errors.firstName || errors.emailId || errors.password) && (
                        <p className="text-xs text-red-500">
                            {errors.firstName?.message || errors.emailId?.message || errors.password?.message}
                        </p>
                    )}

                    {/* Server error — asli wajah dikhti hai */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {mode === 'signup' && !error && (
                        <p className="text-xs text-gray-400">
                            Use 8+ characters with an uppercase letter, a number and a symbol.
                        </p>
                    )}

                    <button type="submit" disabled={busy}
                        className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                        {migrating ? 'Saving your goals...' : mode === 'login' ? 'Log in' : 'Sign up'}
                    </button>
                </form>

                <div className="mt-6 text-sm text-center text-gray-600">
                    {mode === 'login' ? (
                        <>New here? <button onClick={() => setMode('signup')} className="font-medium text-blue-600 hover:underline">Create an account</button></>
                    ) : (
                        <>Already have an account? <button onClick={() => setMode('login')} className="font-medium text-blue-600 hover:underline">Log in</button></>
                    )}
                </div>
            </div>
        </div>
    );
}
