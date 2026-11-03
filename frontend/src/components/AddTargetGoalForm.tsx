'use client';

import { useState, FormEvent } from 'react';
import { useAppDispatch } from '../store/hooks';
import { addTargetGoal } from '../slices/targetGoalSlice';
import { categories } from '../utils/constants';
import { shiftDays, todayKey } from '../utils/dateUtils';
import { Target, Calendar, Plus, X, Bell } from 'lucide-react';

export default function AddTargetGoalForm({ onClose }: { onClose?: () => void }) {
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Study');
    // Default deadline: 7 days from today
    const [deadline, setDeadline] = useState(shiftDays(todayKey(), 7));
    const [progress, setProgress] = useState(0);
    const [remindersEnabled, setRemindersEnabled] = useState(true);
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const clean = title.trim();
        if (!clean || !deadline) return;

        dispatch(addTargetGoal({
            title: clean,
            category,
            deadline,
            progress,
            remindersEnabled,
            notes: notes.trim()
        }));

        setTitle('');
        setNotes('');
        onClose?.();
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Create Target Goal</h3>
                        <p className="text-xs text-gray-500">Set a deadline and get email reminders</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Goal Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Complete Node.js project / Prepare for exam"
                        required
                        maxLength={120}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Deadline Date *
                        </label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                            min={todayKey()}
                            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Initial Progress ({progress}%)
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Description (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Key milestones or steps..."
                        rows={2}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 outline-none"
                    />
                </div>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={remindersEnabled}
                        onChange={(e) => setRemindersEnabled(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600"
                    />
                    <div className="flex-1">
                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                            <Bell className="w-3 h-3 text-blue-600" /> Enable Email Reminders
                        </span>
                        <p className="text-[11px] text-gray-500">Receive alerts 1 & 2 days before the deadline</p>
                    </div>
                </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Add Target Goal
                </button>
            </div>
        </form>
    );
}
