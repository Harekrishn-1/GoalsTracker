'use client';

import { useState, useEffect } from 'react';
import { TargetGoal } from '../types';
import { useAppDispatch } from '../store/hooks';
import { editTargetGoal, removeTargetGoal } from '../slices/targetGoalSlice';
import { getCategoryColor, categories } from '../utils/constants';
import {
    Calendar, Bell, BellOff, CheckCircle2, Clock, Trash2, Edit3, Save, X,
    Trophy, Check, Sparkles
} from 'lucide-react';

export default function TargetGoalCard({ goal }: { goal: TargetGoal }) {
    const dispatch = useAppDispatch();
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(goal.title);
    const [category, setCategory] = useState(goal.category);
    const [deadline, setDeadline] = useState(goal.deadline);
    const [remindersEnabled, setRemindersEnabled] = useState(goal.remindersEnabled);
    const [notes, setNotes] = useState(goal.notes || '');
    const [progressInput, setProgressInput] = useState<number | string>(goal.progress);

    useEffect(() => {
        setProgressInput(goal.progress);
    }, [goal.progress]);

    // Days remaining calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = goal.deadline.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isCompleted = goal.progress === 100;

    const commitProgress = (value: number | string) => {
        let progress = Number(value);
        if (value === '' || Number.isNaN(progress)) {
            setProgressInput(goal.progress);
            return;
        }
        progress = Math.min(100, Math.max(0, progress));
        setProgressInput(progress);
        dispatch(editTargetGoal({ id: goal._id, updates: { progress } }));
    };

    const getCountdownBadge = () => {
        if (isCompleted) {
            return (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed 🎉
                </span>
            );
        }
        if (diffDays < 0) {
            return (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                    ⚠️ Overdue by {Math.abs(diffDays)} day{Math.abs(diffDays) === 1 ? '' : 's'}
                </span>
            );
        }
        if (diffDays === 0) {
            return (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                    🔥 Due Today!
                </span>
            );
        }
        if (diffDays === 1) {
            return (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                    ⏳ Due Tomorrow!
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                <Clock className="w-3 h-3" /> {diffDays} days left
            </span>
        );
    };

    const saveEdit = () => {
        if (!title.trim() || !deadline) return;
        dispatch(editTargetGoal({
            id: goal._id,
            updates: {
                title: title.trim(),
                category,
                deadline,
                remindersEnabled,
                notes: notes.trim()
            }
        }));
        setEditing(false);
    };

    const cancelEdit = () => {
        setTitle(goal.title);
        setCategory(goal.category);
        setDeadline(goal.deadline);
        setRemindersEnabled(goal.remindersEnabled);
        setNotes(goal.notes || '');
        setEditing(false);
    };

    const cardClass = isCompleted
        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg'
        : diffDays < 0
            ? 'bg-red-50/50 border-2 border-red-200'
            : 'bg-white border-2 border-gray-200 hover:border-blue-300 shadow-2xs';

    /* ---------- EDIT MODE ---------- */
    if (editing) {
        return (
            <div className="p-5 bg-white border-2 border-blue-400 rounded-2xl shadow-sm space-y-3">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Goal Title"
                    className="w-full px-3 py-2 border rounded-lg text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm text-gray-700 outline-none"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm text-gray-700 outline-none"
                    />
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes or milestone description..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-xs text-gray-700 outline-none"
                />
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={remindersEnabled}
                        onChange={(e) => setRemindersEnabled(e.target.checked)}
                        className="rounded text-blue-600"
                    />
                    <span>Receive email reminders 1 & 2 days before deadline</span>
                </label>
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={saveEdit}
                        className="flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-4 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                </div>
            </div>
        );
    }

    /* ---------- VIEW MODE ---------- */
    return (
        <div className={`p-5 rounded-2xl transition-all duration-300 ${cardClass}`}>
            {/* Top Row: Category + Countdown */}
            <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                </span>
                {getCountdownBadge()}
            </div>

            {/* Goal Title + Completion Trophy */}
            <div className="flex flex-wrap items-center mb-1 gap-2">
                <h3 className="text-xl font-bold text-gray-900 break-words">
                    {goal.title}
                </h3>

                {isCompleted && (
                    <div className="flex items-center space-x-1.5">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="px-2.5 py-0.5 text-xs font-bold text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse">
                            COMPLETED! 🎉
                        </span>
                    </div>
                )}
            </div>

            {/* Deadline + Reminders */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Target: <strong className="text-gray-700">{goal.deadline}</strong>
                </span>

                {goal.remindersEnabled ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium" title="Email reminder enabled">
                        <Bell className="w-3.5 h-3.5" /> Reminders On
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-gray-400" title="Email reminder disabled">
                        <BellOff className="w-3.5 h-3.5" /> Reminders Off
                    </span>
                )}
            </div>

            {goal.notes && (
                <p className="text-xs text-gray-600 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {goal.notes}
                </p>
            )}

            {/* Progress Section - Color Filled Like Daily Routine */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-3 pt-1">
                    <span className="text-xs font-semibold text-gray-600">Progress:</span>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={progressInput}
                        onChange={(e) => setProgressInput(e.target.value)}
                        onBlur={() => commitProgress(progressInput)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <span className="text-xs font-bold text-gray-600">%</span>

                    {/* Dynamic Gradient Color Fill Bar */}
                    <div className="flex-1 max-w-xs">
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    isCompleted
                                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                                        : goal.progress >= 80
                                            ? 'bg-gradient-to-r from-blue-500 to-emerald-500'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                }`}
                                style={{ width: `${goal.progress}%` }}
                            />
                        </div>
                    </div>

                    {isCompleted && (
                        <div className="flex items-center space-x-1">
                            <Check className="w-4 h-4 text-green-600" />
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                        </div>
                    )}
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex gap-1.5 justify-end items-center pt-1">
                    <span className="text-[11px] text-gray-400">Quick set:</span>
                    {[25, 50, 75, 100].map((step) => (
                        <button
                            key={step}
                            type="button"
                            onClick={() => {
                                setProgressInput(step);
                                dispatch(editTargetGoal({ id: goal._id, updates: { progress: step } }));
                            }}
                            className={`text-[10px] px-2.5 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                                goal.progress === step
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {step}%
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions footer */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                    onClick={() => dispatch(removeTargetGoal(goal._id))}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
            </div>
        </div>
    );
}
