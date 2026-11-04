'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTargetGoals } from '../slices/targetGoalSlice';
import { openAuthModal } from '../slices/authSlice';
import TargetGoalCard from './TargetGoalCard';
import AddTargetGoalForm from './AddTargetGoalForm';
import { Target, Plus, CheckCircle2, Clock, AlertTriangle, Sparkles, Bell, Mail } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

type FilterType = 'all' | 'active' | 'dueSoon' | 'completed';

export default function TargetGoalsSection() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((s) => s.targetGoals);
    const { isAuthenticated } = useAppSelector((s) => s.auth);

    const [filter, setFilter] = useState<FilterType>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);
    const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSendTestEmail = async () => {
        setTestingEmail(true);
        setEmailStatus(null);
        try {
            const res = await axiosClient.post('/target-goal/test-email');
            setEmailStatus({
                type: 'success',
                message: res.data.message || 'Test reminder email sent! Check your inbox / spam.'
            });
        } catch (err: any) {
            const errDetail = err.response?.data?.details?.message || err.response?.data?.details || err.response?.data?.message || err.message;
            setEmailStatus({
                type: 'error',
                message: `Failed to send email: ${typeof errDetail === 'object' ? JSON.stringify(errDetail) : errDetail}`
            });
        } finally {
            setTestingEmail(false);
        }
    };

    useEffect(() => {
        dispatch(fetchTargetGoals());
    }, [dispatch, isAuthenticated]);

    // Compute stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enriched = useMemo(() => {
        return items.map((g) => {
            const [y, m, d] = g.deadline.split('-').map(Number);
            const targetDate = new Date(y, m - 1, d);
            targetDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isCompleted = g.progress === 100;
            const isDueSoon = !isCompleted && diffDays >= 0 && diffDays <= 3;
            const isOverdue = !isCompleted && diffDays < 0;

            return {
                ...g,
                diffDays,
                isCompleted,
                isDueSoon,
                isOverdue
            };
        });
    }, [items, today]);

    const activeCount = enriched.filter((g) => !g.isCompleted).length;
    const dueSoonCount = enriched.filter((g) => g.isDueSoon).length;
    const completedCount = enriched.filter((g) => g.isCompleted).length;

    const filteredList = useMemo(() => {
        switch (filter) {
            case 'active':
                return enriched.filter((g) => !g.isCompleted);
            case 'dueSoon':
                return enriched.filter((g) => g.isDueSoon || g.isOverdue);
            case 'completed':
                return enriched.filter((g) => g.isCompleted);
            case 'all':
            default:
                return enriched;
        }
    }, [enriched, filter]);

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="p-6 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-white/20">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Future Target Goals</h2>
                            <p className="text-blue-100 text-sm">
                                Set long-term deadlines &bull; Track milestones &bull; Get automated email alerts
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isAuthenticated && (
                            <button
                                onClick={handleSendTestEmail}
                                disabled={testingEmail}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur transition-all cursor-pointer disabled:opacity-50"
                                title="Send a test email to your registered email address"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                {testingEmail ? 'Sending...' : 'Send Test Reminder'}
                            </button>
                        )}
                        <button
                            onClick={() => setIsFormOpen(!isFormOpen)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            {isFormOpen ? 'Close Form' : 'New Target Goal'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Email Test Status Banner */}
            {emailStatus && (
                <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 ${
                    emailStatus.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <div className="flex items-center gap-2">
                        <span className="text-base">{emailStatus.type === 'success' ? '✅' : '⚠️'}</span>
                        <span className="font-medium">{emailStatus.message}</span>
                    </div>
                    <button
                        onClick={() => setEmailStatus(null)}
                        className="text-gray-400 hover:text-gray-700 font-bold px-1.5 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Guest Reminder Banner */}
            {!isAuthenticated && (
                <div className="flex items-center justify-between gap-3 p-4 border border-blue-200 bg-blue-50/80 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="text-sm text-blue-900">
                            <strong>Want email alerts?</strong> Sign up to receive automated email reminders 1 and 2 days before your deadlines!
                        </span>
                    </div>
                    <button
                        onClick={() => dispatch(openAuthModal('signup'))}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0 cursor-pointer"
                    >
                        Sign up
                    </button>
                </div>
            )}

            {/* Collapsible Add Form */}
            {isFormOpen && (
                <AddTargetGoalForm onClose={() => setIsFormOpen(false)} />
            )}

            {/* Filter Tabs & Quick Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            filter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        All ({items.length})
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            filter === 'active' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Active ({activeCount})
                    </button>
                    <button
                        onClick={() => setFilter('dueSoon')}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            filter === 'dueSoon' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        🔥 Due Soon ({dueSoonCount})
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            filter === 'completed' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Completed ({completedCount})
                    </button>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                    Showing {filteredList.length} goal{filteredList.length === 1 ? '' : 's'}
                </div>
            </div>

            {/* Grid of Cards */}
            {loading ? (
                <div className="py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent" />
                </div>
            ) : filteredList.length === 0 ? (
                <div className="py-14 text-center bg-white border border-dashed border-gray-300 rounded-2xl">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <h4 className="text-base font-bold text-gray-700 mb-1">
                        {filter === 'completed' ? 'No completed targets yet' : 'No target goals found'}
                    </h4>
                    <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
                        {filter === 'all'
                            ? 'Create your first deadline-based goal (e.g. "Finish project by 4 Nov") to stay on track.'
                            : 'No goals match the selected filter.'}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" /> Create a Target Goal
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredList.map((g) => (
                        <TargetGoalCard key={g._id} goal={g} />
                    ))}
                </div>
            )}
        </div>
    );
}
