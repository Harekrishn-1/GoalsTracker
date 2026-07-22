import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Users, Activity, Target, CheckCircle2, UserPlus, TrendingUp } from 'lucide-react';
import { fetchAdminStats } from '../slices/adminSlice';

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="p-6 border border-purple-100 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <div className={`p-2 rounded-full ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
        </div>
    );
}

export default function AdminPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useSelector((s) => s.auth);
    const { stats, loading, error } = useSelector((s) => s.admin);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) navigate('/');
    }, [authLoading, isAuthenticated, user, navigate]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') dispatch(fetchAdminStats());
    }, [dispatch, isAuthenticated, user]);

    if (user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen p-4 bg-gray-50 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="p-6 text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl">
                    <h1 className="text-2xl font-bold">Admin Overview</h1>
                    <p className="text-green-100">Aggregate usage — no individual goal content is shown.</p>
                </div>

                {loading && (
                    <div className="py-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent" />
                    </div>
                )}

                {error && (
                    <div className="p-4 text-red-700 border border-red-200 rounded-lg bg-red-50">{error}</div>
                )}

                {stats && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
                        <StatCard icon={Activity} label="Active Today" value={stats.activeToday}
                            sub="Signed in or edited in last 24h" color="bg-green-500" />
                        <StatCard icon={TrendingUp} label="Active This Week" value={stats.activeThisWeek} color="bg-purple-500" />
                        <StatCard icon={UserPlus} label="New This Week" value={stats.newThisWeek} color="bg-orange-500" />
                        <StatCard icon={Target} label="Total Goals" value={stats.totalGoals} color="bg-indigo-500" />
                        <StatCard icon={CheckCircle2} label="Goals Completed" value={stats.goalsCompleted}
                            sub={`${stats.completionRate}% completion rate`} color="bg-emerald-500" />
                    </div>
                )}
            </div>
        </div>
    );
}
