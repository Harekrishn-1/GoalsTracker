'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Target, Lock, CalendarDays } from 'lucide-react';

import AddGoalForm from '../components/AddGoalForm';
import GoalCard from '../components/GoalCard';
import CopyGoalsModal from '../components/CopyGoalsModal';
import MonthlyCalendar from '../components/MonthlyCalendar';
import GuestBanner from '../components/GuestBanner';
import TargetGoalsSection from '../components/TargetGoalsSection';
import { QuoteToasts, NudgeToasts } from '../components/Notifications';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGoals, submitDay, copyGoals, setSelectedDate, reorderGoals } from '../slices/goalSlice';
import { openAuthModal } from '../slices/authSlice';
import { todayKey, shiftDays, parseKey } from '../utils/dateUtils';
import {
    motivationalQuotesData, almostThereQuotes,
    formatDisplayDate, calculateTotalProgress
} from '../utils/constants';
import { MotivationalQuote, NudgeToast } from '../types';

export default function GoalsPage() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((s) => s.goals);
    const { isAuthenticated } = useAppSelector((s) => s.auth);

    const [viewMode, setViewMode] = useState<'daily' | 'targets'>('daily');
    const [date, setDate] = useState(todayKey());
    const [copyOpen, setCopyOpen] = useState(false);
    const [quotes, setQuotes] = useState<MotivationalQuote[]>([]);
    const [nudges, setNudges] = useState<NudgeToast[]>([]);

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
        if (!isAuthenticated) {
            dispatch(openAuthModal('signup'));
            return;
        }
        dispatch(submitDay(date)).then(() => showQuote());
    };

    const handleCopyConfirm = (goalIds: string[]) => {
        setCopyOpen(false);
        dispatch(copyGoals({ fromDate: date, toDate: shiftDays(date, 1), goalIds }))
            .then(() => dispatch(fetchGoals(date)));
    };

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        dispatch(reorderGoals({ sourceIndex: index, destinationIndex: index - 1 }));
    };

    const handleMoveDown = (index: number) => {
        if (index >= todaysGoals.length - 1) return;
        dispatch(reorderGoals({ sourceIndex: index, destinationIndex: index + 1 }));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDrop = (targetIndex: number) => {
        if (draggedIndex === null || draggedIndex === targetIndex) return;
        dispatch(reorderGoals({ sourceIndex: draggedIndex, destinationIndex: targetIndex }));
        setDraggedIndex(null);
    };

    return (
        <div className="min-h-screen p-4 bg-gray-50 md:p-8">
            <div className="relative max-w-6xl mx-auto space-y-6">
                <QuoteToasts items={quotes} onHide={(id) => setQuotes((p) => p.filter((q) => q.id !== id))} />
                <NudgeToasts items={nudges} onHide={(id) => setNudges((p) => p.filter((n) => n.id !== id))} />

                {/* Top Segmented Tab Switch: Daily Routine vs Target Goals */}
                <div className="flex justify-center">
                    <div className="inline-flex p-1.5 bg-white border border-gray-200 rounded-2xl shadow-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('daily')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                                viewMode === 'daily'
                                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <CalendarDays className="w-4 h-4" /> Daily Routine
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('targets')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                                viewMode === 'targets'
                                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Target className="w-4 h-4" /> Target Goals (Deadlines)
                        </button>
                    </div>
                </div>

                {viewMode === 'targets' ? (
                    /* Target Goals View */
                    <TargetGoalsSection />
                ) : (
                    /* Daily Routine View */
                    <div className="space-y-6">
                        <GuestBanner />

                        {/* Header */}
                        <div className="p-6 text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 rounded-full bg-white/20">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">My Daily Goals</h1>
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
                            <button
                                type="button"
                                onClick={() => setDate(shiftDays(date, -1))}
                                className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
                            >
                                ← Previous
                            </button>
                            {date !== todayKey() && (
                                <button
                                    type="button"
                                    onClick={() => setDate(todayKey())}
                                    className="px-4 py-2 font-medium text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 cursor-pointer text-sm"
                                >
                                    Today
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setDate(shiftDays(date, 1))}
                                className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
                            >
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
                                <p className="mb-6 text-gray-400 text-sm">
                                    Start by creating your first goal for {formatDisplayDate(parseKey(date))}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todaysGoals.map((g, idx) => (
                                    <GoalCard
                                        key={g._id}
                                        goal={g}
                                        index={idx}
                                        totalGoals={todaysGoals.length}
                                        onMoveUp={() => handleMoveUp(idx)}
                                        onMoveDown={() => handleMoveDown(idx)}
                                        onDragStart={handleDragStart}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        onComplete={showQuote}
                                        onAlmost={showNudge}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitted}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                                    isSubmitted
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}
                            >
                                {isSubmitted ? 'Goals Submitted ✅' : isAuthenticated ? 'Submit Goals' : 'Sign up to Submit'}
                            </button>

                            <span className="font-medium text-gray-600">Total: {totalProgress}%</span>

                            <button
                                type="button"
                                onClick={() => setCopyOpen(true)}
                                disabled={todaysGoals.length === 0}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                                    todaysGoals.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}
                            >
                                📋 Copy to Next Day
                            </button>
                        </div>

                        {/* Monthly Calendar with Category Breakdown */}
                        <MonthlyCalendar selectedDate={date} onSelectDate={setDate} />
                    </div>
                )}
            </div>

            <CopyGoalsModal
                open={copyOpen}
                goals={todaysGoals}
                onCancel={() => setCopyOpen(false)}
                onConfirm={handleCopyConfirm}
            />
        </div>
    );
}
