import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Trophy, Lock, Check, Sparkles } from 'lucide-react';
import { editGoal, removeGoal } from '../slices/goalSlice';
import { getCategoryColor, categories } from '../utils/constants';
import { formatTimeRange } from '../utils/dateUtils';

export default function GoalCard({ goal, onComplete, onAlmost }) {
    const dispatch = useDispatch();
    const [editing, setEditing] = useState(false);

    const [title, setTitle] = useState(goal.title);
    const [category, setCategory] = useState(goal.category);
    const [startTime, setStartTime] = useState(goal.startTime || '');
    const [endTime, setEndTime] = useState(goal.endTime || '');

    const locked = goal.submitted;
    const completed = goal.progress === 100;
    const timeRange = formatTimeRange(goal.startTime, goal.endTime);

    const updateProgress = (value) => {
        const progress = Math.min(100, Math.max(0, Number(value) || 0));
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
            : 'bg-gray-100';

    /* ---------- EDIT MODE ---------- */
    if (editing && !locked) {
        return (
            <div className="p-6 bg-white border-2 border-blue-300 rounded-xl">
                <div className="space-y-3">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        autoFocus
                        placeholder="Goal title"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={saveEdit}
                            className="px-6 py-2 font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
                        >
                            Save
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="px-6 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
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
        <div className={`rounded-xl p-6 transition-all duration-300 ${cardClass}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    {/* Time upar — green mein */}
                    {timeRange && (
                        <p className="mb-1 text-sm font-semibold text-green-600">{timeRange}</p>
                    )}

                    {/* Goal naam neeche — dark */}
                    <div className="flex items-center mb-2 space-x-3">
                        <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>

                        {completed && !locked && (
                            <div className="flex items-center space-x-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span className="px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse">
                                    COMPLETED! 🎉
                                </span>
                            </div>
                        )}

                        {locked && (
                            <div className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-green-600" />
                                <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                                    SUBMITTED
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                        <p>
                            Category:{' '}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
                                {goal.category}
                            </span>
                        </p>

                        <div className="flex items-center space-x-3">
                            <span>Progress:</span>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={goal.progress}
                                onChange={(e) => updateProgress(e.target.value)}
                                disabled={locked}
                                className={`w-16 px-2 py-1 border border-gray-300 rounded text-center ${
                                    locked ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            />
                            <span>%</span>

                            <div className="flex-1 max-w-xs">
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${
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

                {/* Edit + Delete — sirf jab locked nahi */}
                <div className="flex space-x-2">
                    {!locked && (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-4 py-2 text-gray-700 transition-colors bg-gray-300 rounded-lg hover:bg-gray-400"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        onClick={() => dispatch(removeGoal(goal._id))}
                        disabled={locked}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            locked
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                        }`}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
