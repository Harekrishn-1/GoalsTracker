'use client';

import { useEffect, useState, useMemo } from 'react';
import { Lock, Filter, CalendarDays } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGoals } from '../slices/goalSlice';
import { toKey, todayKey } from '../utils/dateUtils';
import { categories, getCategoryColor } from '../utils/constants';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

type CategoryFilterType = 'Total' | 'Personal' | 'Study' | 'Work' | 'Health';

export default function MonthlyCalendar({
    selectedDate,
    onSelectDate
}: {
    selectedDate: string;
    onSelectDate: (date: string) => void;
}) {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((s) => s.auth);
    const allGoals = useAppSelector((s) => s.goals.allItems);

    const sel = new Date(selectedDate);
    const [year, setYear] = useState(sel.getFullYear());
    const [month, setMonth] = useState(sel.getMonth());
    const [activeCategory, setActiveCategory] = useState<CategoryFilterType>('Total');

    useEffect(() => {
        dispatch(fetchGoals({ all: true }));
    }, [dispatch, isAuthenticated]);

    const byDate = useMemo(() => {
        const rawMap = new Map<string, {
            totalSum: number;
            totalCount: number;
            allSubmitted: boolean;
            catStats: Record<string, { sum: number; count: number }>;
        }>();

        for (const g of allGoals || []) {
            const e = rawMap.get(g.date) || {
                totalSum: 0,
                totalCount: 0,
                allSubmitted: true,
                catStats: {}
            };
            e.totalSum += g.progress;
            e.totalCount += 1;
            if (!g.submitted) e.allSubmitted = false;

            const cat = g.category || 'Personal';
            if (!e.catStats[cat]) {
                e.catStats[cat] = { sum: 0, count: 0 };
            }
            e.catStats[cat].sum += g.progress;
            e.catStats[cat].count += 1;

            rawMap.set(g.date, e);
        }

        const out = new Map<string, {
            totalProgress: number;
            hasGoals: boolean;
            submitted: boolean;
            categories: Record<string, { progress: number; count: number }>;
        }>();

        for (const [k, e] of rawMap) {
            const catMap: Record<string, { progress: number; count: number }> = {};
            for (const [catName, metric] of Object.entries(e.catStats)) {
                catMap[catName] = {
                    progress: Math.round(metric.sum / metric.count),
                    count: metric.count
                };
            }

            out.set(k, {
                totalProgress: Math.round(e.totalSum / e.totalCount),
                hasGoals: true,
                submitted: e.allSubmitted,
                categories: catMap
            });
        }
        return out;
    }, [allGoals]);

    const days = useMemo(() => {
        const first = new Date(year, month, 1);
        const total = new Date(year, month + 1, 0).getDate();
        const lead = first.getDay();
        const out: (number | null)[] = [];
        for (let i = 0; i < lead; i++) out.push(null);
        for (let d = 1; d <= total; d++) out.push(d);
        return out;
    }, [year, month]);

    const shiftMonth = (n: number) => {
        const d = new Date(year, month + n, 1);
        setYear(d.getFullYear());
        setMonth(d.getMonth());
    };

    const today = todayKey();
    const selectedDayData = byDate.get(selectedDate);

    return (
        <div className="p-6 border border-purple-100 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-blue-600" />
                        Monthly Progress Calendar
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Select a category from the dropdown to view its progress % on the calendar</p>
                </div>

                {/* Category Filter Dropdown */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <label htmlFor="calendar-category-select" className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-blue-600" /> View By:
                    </label>
                    <div className="relative">
                        <select
                            id="calendar-category-select"
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value as CategoryFilterType)}
                            className="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-white text-gray-800 shadow-2xs hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="Total">🎯 Total Progress</option>
                            <option value="Personal">🟣 Personal Goals</option>
                            <option value="Study">🔵 Study Goals</option>
                            <option value="Work">🟢 Work Goals</option>
                            <option value="Health">🔴 Health Goals</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 cursor-pointer text-sm font-medium"
                >
                    &lt; Prev
                </button>
                <h3 className="text-lg font-semibold text-gray-700">
                    {monthNames[month]} {year}{' '}
                    {activeCategory !== 'Total' && (
                        <span className="text-xs px-2 py-0.5 ml-2 font-medium rounded-full bg-purple-100 text-purple-700">
                            Viewing: {activeCategory}
                        </span>
                    )}
                </h3>
                <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 cursor-pointer text-sm font-medium"
                >
                    Next &gt;
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {dayNames.map((d) => (
                    <div key={d} className="py-2 text-xs font-bold text-center text-gray-500 uppercase tracking-wider">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} className="h-20 bg-gray-100/60 rounded-lg" />;

                    const key = toKey(new Date(year, month, day));
                    const info = byDate.get(key);
                    const isSelected = key === selectedDate;

                    // Compute category-specific progress or total progress
                    let displayPercent: number | null = null;
                    let barColor = 'bg-blue-500';

                    if (info?.hasGoals) {
                        if (activeCategory === 'Total') {
                            displayPercent = info.totalProgress;
                            barColor = info.totalProgress >= 50 ? 'bg-green-400' : 'bg-red-400';
                        } else {
                            const catStat = info.categories[activeCategory];
                            if (catStat) {
                                displayPercent = catStat.progress;
                                if (activeCategory === 'Personal') barColor = 'bg-purple-500';
                                else if (activeCategory === 'Study') barColor = 'bg-blue-500';
                                else if (activeCategory === 'Work') barColor = 'bg-emerald-500';
                                else if (activeCategory === 'Health') barColor = 'bg-red-500';
                            }
                        }
                    }

                    return (
                        <div
                            key={key}
                            onClick={() => onSelectDate(key)}
                            className={`h-20 border-2 rounded-lg cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between p-1.5 ${
                                isSelected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                        >
                            {/* Fill bar */}
                            {displayPercent !== null && (
                                <div
                                    className={`absolute bottom-0 left-0 w-full transition-all duration-500 ${barColor}`}
                                    style={{ height: `${displayPercent}%`, opacity: 0.25 }}
                                />
                            )}

                            {/* Top header row inside cell */}
                            <div className="flex items-center justify-between w-full relative z-10">
                                <span className={`text-xs font-semibold ${key === today ? 'text-blue-700 font-bold bg-blue-100 px-1.5 py-0.5 rounded-full' : 'text-gray-700'}`}>
                                    {day}
                                </span>
                                {info?.submitted && <Lock className="w-3 h-3 text-green-600" />}
                            </div>

                            {/* Center Percent value */}
                            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                                {displayPercent !== null ? (
                                    <span className={`text-sm font-bold ${
                                        displayPercent >= 80 ? 'text-green-700' : displayPercent >= 50 ? 'text-blue-700' : 'text-gray-800'
                                    }`}>
                                        {displayPercent}%
                                    </span>
                                ) : info?.hasGoals && activeCategory !== 'Total' ? (
                                    <span className="text-[10px] text-gray-300 font-medium">-</span>
                                ) : null}
                            </div>

                            {/* Bottom mini indicator dots for available categories on that day */}
                            {info?.hasGoals && (
                                <div className="flex justify-center items-center gap-1 relative z-10">
                                    {info.categories['Personal'] && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title={`Personal: ${info.categories['Personal'].progress}%`} />}
                                    {info.categories['Study'] && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`Study: ${info.categories['Study'].progress}%`} />}
                                    {info.categories['Work'] && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title={`Work: ${info.categories['Work'].progress}%`} />}
                                    {info.categories['Health'] && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title={`Health: ${info.categories['Health'].progress}%`} />}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Selected Date Category Breakdown Card */}
            {selectedDayData ? (
                <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-800">
                            📅 {selectedDate} — Detailed Category Breakdown:
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-green-600 to-blue-600 text-white">
                            Day Average: {selectedDayData.totalProgress}%
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {categories.map((cat) => {
                            const stat = selectedDayData.categories[cat];
                            return (
                                <div key={cat} className="p-3 bg-white rounded-lg border border-gray-200 flex flex-col justify-between shadow-2xs">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(cat)}`}>
                                            {cat}
                                        </span>
                                        <span className="text-xs font-bold text-gray-800">
                                            {stat ? `${stat.progress}%` : '0%'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-1.5 rounded-full ${
                                                cat === 'Personal' ? 'bg-purple-500' :
                                                cat === 'Study' ? 'bg-blue-500' :
                                                cat === 'Work' ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${stat?.progress || 0}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-gray-600">
                <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 bg-red-400 rounded" />
                    <span>&lt; 50% Progress</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 bg-green-400 rounded" />
                    <span>≥ 50% Progress</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-green-600" />
                    <span>Day Submitted & Locked</span>
                </div>
            </div>
        </div>
    );
}
