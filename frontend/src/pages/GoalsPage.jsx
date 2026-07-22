import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Target, Lock } from 'lucide-react';

import AddGoalForm from '../components/AddGoalForm';
import GoalCard from '../components/GoalCard';
import CopyGoalsModal from '../components/CopyGoalsModal';
import MonthlyCalendar from '../components/MonthlyCalendar';
import GuestBanner from '../components/GuestBanner';
import { QuoteToasts, NudgeToasts } from '../components/Notifications';

import { fetchGoals, submitDay, copyGoals, setSelectedDate } from '../slices/goalSlice';
import { openAuthModal } from '../slices/authSlice';
import { todayKey, shiftDays, parseKey } from '../utils/dateUtils';
import {
    motivationalQuotesData, almostThereQuotes,
    formatDisplayDate, calculateTotalProgress
} from '../utils/constants';

export default function GoalsPage() {
    const dispatch = useDispatch();
    const { items, loading } = useSelector((s) => s.goals);
    const { isAuthenticated } = useSelector((s) => s.auth);

    const [date, setDate] = useState(todayKey());
    const [copyOpen, setCopyOpen] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [nudges, setNudges] = useState([]);

    useEffect(() => {
        dispatch(setSelectedDate(date));
        dispatch(fetchGoals(date));
    }, [dispatch, date, isAuthenticated]);

    const todaysGoals = useMemo(() => items.filter((g) => g.date === date), [items, date]);
    const totalProgress = calculateTotalProgress(todaysGoals);
    const isSubmitted = todaysGoals.length > 0 && todaysGoals.every((g) => g.submitted);

    const showQuote = useCallback(() => {
        const id = Date.now().toString();
        const q = motivationalQuotesData[Math.floor(Math.random() * motivationalQuotesData.length)];
        setQuotes((prev) => [...prev, { id, ...q }]);
        setTimeout(() => setQuotes((prev) => prev.filter((x) => x.id !== id)), 8000);
    }, []);

    const showNudge = useCallback(() => {
        const id = Date.now().toString();
        const text = almostThereQuotes[Math.floor(Math.random() * almostThereQuotes.length)];
        setNudges((prev) => [...prev, { id, text }]);
        setTimeout(() => setNudges((prev) => prev.filter((x) => x.id !== id)), 5000);
    }, []);

    const handleSubmit = () => {
        if (isSubmitted) return;
        if (!isAuthenticated) { dispatch(openAuthModal('signup')); return; }
        dispatch(submitDay(date)).then(() => showQuote());
    };

    const handleCopyConfirm = (goalIds) => {
        setCopyOpen(false);
        dispatch(copyGoals({ fromDate: date, toDate: shiftDays(date, 1), goalIds }))
            .then(() => dispatch(fetchGoals(date)));
    };

    return (
        <div className="min-h-screen p-4 bg-gray-50 md:p-8">
            <div className="relative max-w-6xl mx-auto space-y-6">
                <QuoteToasts items={quotes} onHide={(id) => setQuotes((p) => p.filter((q) => q.id !== id))} />
                <NudgeToasts items={nudges} onHide={(id) => setNudges((p) => p.filter((n) => n.id !== id))} />

                <GuestBanner />

                {/* Header */}
                <div className="p-6 text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-white/20">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">My Goals</h1>
                                <p className="text-green-100">
                                    {date === todayKey() ? 'Today: ' : ''}{formatDisplayDate(parseKey(date))}
                                </p>
                                {isSubmitted && (
                                    <div className="flex items-center mt-1 space-x-2">
                                        <Lock className="w-4 h-4 text-yellow-200" />
                                        <span className="text-sm font-medium text-yellow-200">Goals Submitted &amp; Locked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{totalProgress}%</div>
                            <div className="text-sm text-green-100">Total Progress</div>
                        </div>
                    </div>
                </div>

                {/* Date navigation */}
                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setDate(shiftDays(date, -1))}
                        className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        ← Previous
                    </button>
                    {date !== todayKey() && (
                        <button onClick={() => setDate(todayKey())}
                            className="px-4 py-2 font-medium text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
                            Today
                        </button>
                    )}
                    <button onClick={() => setDate(shiftDays(date, 1))}
                        className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Next →
                    </button>
                </div>

                {/* Add form */}
                {!isSubmitted && <AddGoalForm date={date} />}

                {/* Goals */}
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent" />
                    </div>
                ) : todaysGoals.length === 0 ? (
                    <div className="py-12 text-center">
                        <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-500">No goals for this day</h3>
                        <p className="mb-6 text-gray-400">
                            Start by creating your first goal for {formatDisplayDate(parseKey(date))}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {todaysGoals.map((g) => (
                            <GoalCard key={g._id} goal={g} onComplete={showQuote} onAlmost={showNudge} />
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button onClick={handleSubmit} disabled={isSubmitted}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            isSubmitted ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}>
                        {isSubmitted ? 'Goals Submitted ✅' : isAuthenticated ? 'Submit Goals' : 'Sign up to Submit'}
                    </button>

                    <span className="font-medium text-gray-600">Total: {totalProgress}%</span>

                    <button onClick={() => setCopyOpen(true)} disabled={todaysGoals.length === 0}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            todaysGoals.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}>
                        📋 Copy to Next Day
                    </button>
                </div>

                {/* Calendar */}
                <MonthlyCalendar selectedDate={date} onSelectDate={setDate} />
            </div>

            <CopyGoalsModal open={copyOpen} goals={todaysGoals}
                onCancel={() => setCopyOpen(false)} onConfirm={handleCopyConfirm} />
        </div>
    );
}
