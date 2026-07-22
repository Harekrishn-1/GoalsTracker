import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addGoal } from '../slices/goalSlice';
import { categories } from '../utils/constants';

export default function AddGoalForm({ date }) {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Personal');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const submit = (e) => {
        e.preventDefault();
        const clean = title.trim();
        if (!clean) return;
        dispatch(addGoal({ title: clean, category, startTime, endTime, date, progress: 0 }));
        setTitle(''); setStartTime(''); setEndTime('');
    };

    return (
        <div className="p-6 border border-purple-100 bg-white/80 backdrop-blur-sm rounded-xl">
            <form onSubmit={submit} className="grid items-end grid-cols-1 gap-4 md:grid-cols-6">
                <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Goal</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter goal title..."
                        required
                        maxLength={100}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Start Time</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">End Time</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <button type="submit"
                    className="px-6 py-2 font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600">
                    Add
                </button>
            </form>
        </div>
    );
}
