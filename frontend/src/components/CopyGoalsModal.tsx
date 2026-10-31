'use client';

import { useState, useEffect } from 'react';
import { getCategoryColor } from '../utils/constants';
import { Goal } from '../types';

export default function CopyGoalsModal({
    open,
    goals,
    onCancel,
    onConfirm
}: {
    open: boolean;
    goals: Goal[];
    onCancel: () => void;
    onConfirm: (goalIds: string[]) => void;
}) {
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        if (open) setSelected(goals.map((g) => g._id));
    }, [open, goals]);

    if (!open) return null;

    const toggle = (id: string) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const canCopy = selected.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                <h3 className="mb-6 text-2xl font-bold text-center text-gray-900">📋 Select Goals to Copy</h3>

                <div className="mb-6 space-y-4">
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => setSelected(goals.map((g) => g._id))}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 cursor-pointer"
                        >
                            ✅ Select All
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelected([])}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600 cursor-pointer"
                        >
                            ❌ Deselect All
                        </button>
                    </div>

                    <div className="space-y-2">
                        {goals.length === 0 && (
                            <p className="py-4 text-sm text-center text-gray-500">No goals to copy.</p>
                        )}
                        {goals.map((g) => (
                            <label
                                key={g._id}
                                className="flex items-center p-3 space-x-3 transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(g._id)}
                                    onChange={() => toggle(g._id)}
                                    className="w-4 h-4 text-blue-500 rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{g.title}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(g.category)}`}>
                                        {g.category}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => onConfirm(selected)}
                        disabled={!canCopy}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                            canCopy
                                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        🚀 Copy {selected.length} Goal{selected.length === 1 ? '' : 's'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
