import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Lock } from 'lucide-react';
import { fetchGoals } from '../slices/goalSlice';
import { toKey, todayKey } from '../utils/dateUtils';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

export default function MonthlyCalendar({ selectedDate, onSelectDate }) {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const allGoals = useSelector((s) => s.goals.allItems);

    const sel = new Date(selectedDate);
    const [year, setYear] = useState(sel.getFullYear());
    const [month, setMonth] = useState(sel.getMonth());

    useEffect(() => {
        dispatch(fetchGoals({ all: true }));
    }, [dispatch, isAuthenticated]);

    const byDate = useMemo(() => {
        const map = new Map();
        for (const g of allGoals || []) {
            const e = map.get(g.date) || { sum: 0, count: 0, allSubmitted: true };
            e.sum += g.progress; e.count += 1;
            if (!g.submitted) e.allSubmitted = false;
            map.set(g.date, e);
        }
        const out = new Map();
        for (const [k, e] of map)
            out.set(k, { progress: Math.round(e.sum / e.count), hasGoals: true, submitted: e.allSubmitted });
        return out;
    }, [allGoals]);

    const days = useMemo(() => {
        const first = new Date(year, month, 1);
        const total = new Date(year, month + 1, 0).getDate();
        const lead = first.getDay();
        const out = [];
        for (let i = 0; i < lead; i++) out.push(null);
        for (let d = 1; d <= total; d++) out.push(d);
        return out;
    }, [year, month]);

    const shiftMonth = (n) => {
        const d = new Date(year, month + n, 1);
        setYear(d.getFullYear()); setMonth(d.getMonth());
    };

    const today = todayKey();

    return (
        <div className="p-6 border border-purple-100 bg-white/80 backdrop-blur-sm rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">Monthly Progress Calendar</h2>

            <div className="flex items-center justify-between mb-6">
                <button onClick={() => shiftMonth(-1)}
                    className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
                    &lt; Prev
                </button>
                <h3 className="text-xl font-semibold text-gray-700">{monthNames[month]} {year}</h3>
                <button onClick={() => shiftMonth(1)}
                    className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
                    Next &gt;
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {dayNames.map((d) => (
                    <div key={d} className="py-2 font-medium text-center text-gray-600">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} className="h-20 bg-gray-200 rounded-lg" />;

                    const key = toKey(new Date(year, month, day));
                    const info = byDate.get(key);
                    const isSelected = key === selectedDate;

                    return (
                        <div key={key} onClick={() => onSelectDate(key)}
                            className={`h-20 border-2 rounded-lg cursor-pointer transition-all relative overflow-hidden ${
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
                            }`}>
                            {info?.hasGoals && (
                                <div className={`absolute bottom-0 left-0 w-full transition-all duration-500 ${
                                        info.progress >= 50 ? 'bg-green-400' : 'bg-red-400'
                                    }`}
                                    style={{ height: `${info.progress}%` }} />
                            )}
                            <div className="relative flex flex-col items-center justify-center h-full">
                                <span className={`font-medium ${key === today ? 'text-blue-700 font-bold' : 'text-gray-800'}`}>
                                    {day}
                                </span>
                                {info?.hasGoals && (
                                    <span className="text-xs font-semibold text-gray-700">{info.progress}%</span>
                                )}
                                {info?.submitted && <Lock className="w-3 h-3 mt-0.5 text-gray-600" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-400 rounded" />
                    <span>&lt; 50% Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-400 rounded" />
                    <span>≥ 50% Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span>Submitted</span>
                </div>
            </div>
        </div>
    );
}
