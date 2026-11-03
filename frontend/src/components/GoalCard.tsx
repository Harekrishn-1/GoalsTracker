'use client';

import { useState, useEffect } from 'react';
import { Trophy, Lock, Check, Sparkles, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { editGoal, removeGoal } from '../slices/goalSlice';
import { getCategoryColor, categories } from '../utils/constants';
import { formatTimeRange } from '../utils/dateUtils';
import { Goal } from '../types';

export default function GoalCard({
    goal,
    onComplete,
    onAlmost,
    index,
    totalGoals,
    onMoveUp,
    onMoveDown,
    onDragStart,
    onDragOver,
    onDrop
}: {
    goal: Goal;
    onComplete?: (title: string) => void;
    onAlmost?: () => void;
    index?: number;
    totalGoals?: number;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDragStart?: (index: number) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (index: number) => void;
}) {
    const dispatch = useAppDispatch();
    const [editing, setEditing] = useState(false);

    const [title, setTitle] = useState(goal.title);
    const [category, setCategory] = useState(goal.category);
    const [startTime, setStartTime] = useState(goal.startTime || '');
    const [endTime, setEndTime] = useState(goal.endTime || '');
    const [progressInput, setProgressInput] = useState<number | string>(goal.progress);

    useEffect(() => {
        setProgressInput(goal.progress);
    }, [goal.progress]);

    const locked = goal.submitted;
    const completed = goal.progress === 100;
    const timeRange = formatTimeRange(goal.startTime, goal.endTime);

    const commitProgress = (value: number | string) => {
        let progress = Number(value);
        if (value === '' || Number.isNaN(progress)) {
            setProgressInput(goal.progress); // galat input pe wapas purana
            return;
        }
        progress = Math.min(100, Math.max(0, progress));
        setProgressInput(progress);

        const prev = goal.progress;
        dispatch(editGoal({ id: goal._id, updates: { progress } }));
        if (progress === 100 && prev !== 100) onComplete?.(goal.title);
        else if (progress >= 80 && progress < 100 && prev < 80) onAlmost?.();
    };

    const saveEdit = () => {
        const clean = title.trim();
        if (!clean) return;
        dispatch(editGoal({ id: goal._id, updates: { title: clean, category, startTime, endTime } }));
        setEditing(false);
    };

    const cancelEdit = () => {
        setTitle(goal.title);
        setCategory(goal.category);
        setStartTime(goal.startTime || '');
        setEndTime(goal.endTime || '');
        setEditing(false);
    };

    const cardClass = locked
        ? 'bg-green-50 border-2 border-green-200'
        : completed
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg'
            : 'bg-white border-2 border-gray-200 hover:border-blue-300 shadow-2xs';

    /* ---------- EDIT MODE ---------- */
    if (editing && !locked) {
        return (
            <div className="p-6 bg-white border-2 border-blue-400 rounded-xl shadow-sm">
                <div className="space-y-3">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        autoFocus
                        placeholder="Goal title"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={saveEdit}
                            className="px-6 py-2 font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600 cursor-pointer"
                        >
                            Save
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="px-6 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------- VIEW MODE ---------- */
    return (
        <div
            draggable={!locked && !editing}
            onDragStart={() => index !== undefined && onDragStart?.(index)}
            onDragOver={(e) => onDragOver?.(e)}
            onDrop={() => index !== undefined && onDrop?.(index)}
            className={`rounded-xl p-5 transition-all duration-300 relative ${cardClass}`}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Left Drag Grip / Reorder Buttons (Up & Down) */}
                {!locked && (
                    <div className="flex flex-col items-center justify-center self-center shrink-0 p-1 bg-gray-50/80 rounded-lg border border-gray-200">
                        <button
                            type="button"
                            disabled={index === 0}
                            onClick={onMoveUp}
                            title="Move goal up"
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>

                        <span title="Drag to reorder">
                            <GripVertical className="w-3.5 h-3.5 text-gray-400 my-0.5 cursor-grab active:cursor-grabbing" />
                        </span>

                        <button
                            type="button"
                            disabled={index !== undefined && totalGoals !== undefined && index === totalGoals - 1}
                            onClick={onMoveDown}
                            title="Move goal down"
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Main Goal Details */}
                <div className="flex-1 min-w-0">
                    {/* Time range header */}
                    {timeRange && (
                        <p className="mb-1 text-sm font-semibold text-green-600">{timeRange}</p>
                    )}

                    {/* Goal Title */}
                    <div className="flex flex-wrap items-center mb-2 gap-2">
                        <h3 className="text-xl font-bold text-gray-900 break-words">{goal.title}</h3>

                        {completed && !locked && (
                            <div className="flex items-center space-x-1.5">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span className="px-2.5 py-0.5 text-xs font-bold text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse">
                                    COMPLETED! 🎉
                                </span>
                            </div>
                        )}

                        {locked && (
                            <div className="flex items-center space-x-1.5">
                                <Lock className="w-4 h-4 text-green-600" />
                                <span className="px-2 py-0.5 text-xs font-medium text-white bg-green-500 rounded-full">
                                    SUBMITTED
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-1.5">
                            <span>Category:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(goal.category)}`}>
                                {goal.category}
                            </span>
                        </p>

                        {/* Progress Bar & Input */}
                        <div className="flex items-center space-x-3 pt-1">
                            <span className="text-xs font-medium text-gray-600">Progress:</span>
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
                                disabled={locked}
                                className={`w-16 px-2 py-1 border border-gray-300 rounded text-center font-semibold text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                                    locked ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                }`}
                            />
                            <span className="text-xs font-bold text-gray-600">%</span>

                            <div className="flex-1 max-w-xs">
                                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            completed ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${goal.progress}%` }}
                                    />
                                </div>
                            </div>

                            {completed && (
                                <div className="flex items-center space-x-1">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit + Delete — only when not locked */}
                <div className="flex items-center space-x-2 shrink-0">
                    {!locked && (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        onClick={() => dispatch(removeGoal(goal._id))}
                        disabled={locked}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            locked
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700'
                        }`}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
