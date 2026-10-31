import { Goal, GoalCategory } from '../types';

// Guest ka saara data yahan rehta hai. Login ke baad ye backend pe migrate
// ho jaata hai aur localStorage clear kar dete hain.

const GOALS_KEY = 'streakly_guest_goals';

const isBrowser = typeof window !== 'undefined';

const read = (key: string): Goal[] => {
    if (!isBrowser) return [];
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const write = (key: string, value: Goal[]): void => {
    if (!isBrowser) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage full / private mode — ignore
    }
};

// Guest ke liye temporary id
const tempId = () => `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/* ---------------- GOALS ---------------- */

export const guestGetGoals = (date?: string): Goal[] => {
    const all = read(GOALS_KEY);
    return date ? all.filter((g) => g.date === date) : all;
};

export const guestCreateGoal = ({
    title,
    category,
    date,
    progress,
    startTime,
    endTime
}: {
    title: string;
    category?: GoalCategory;
    date: string;
    progress?: number;
    startTime?: string;
    endTime?: string;
}): Goal => {
    const all = read(GOALS_KEY);
    const goal: Goal = {
        _id: tempId(),
        title,
        category: category || 'Personal',
        startTime: startTime || '',
        endTime: endTime || '',
        date,
        progress: progress || 0,
        submitted: false
    };
    all.push(goal);
    write(GOALS_KEY, all);
    return goal;
};

export const guestUpdateGoal = (id: string, updates: Partial<Goal>): Goal | null => {
    const all = read(GOALS_KEY);
    const idx = all.findIndex((g) => g._id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    write(GOALS_KEY, all);
    return all[idx];
};

export const guestSubmitDay = (date: string): Goal[] => {
    const all = read(GOALS_KEY);
    for (const g of all) {
        if (g.date === date) g.submitted = true;
    }
    write(GOALS_KEY, all);
    return all.filter((g) => g.date === date);
};

export const guestDeleteGoal = (id: string): void => {
    write(GOALS_KEY, read(GOALS_KEY).filter((g) => g._id !== id));
};

export const guestCopyGoals = (fromDate: string, toDate: string, goalIds: string[]): Goal[] => {
    const all = read(GOALS_KEY);
    let source = all.filter((g) => g.date === fromDate);
    if (Array.isArray(goalIds) && goalIds.length) {
        source = source.filter((g) => goalIds.includes(g._id));
    }

    const copies: Goal[] = source.map((g) => ({
        _id: tempId(),
        title: g.title,
        category: g.category,
        startTime: g.startTime || '',
        endTime: g.endTime || '',
        date: toDate,
        progress: 0,
        submitted: false
    }));
    write(GOALS_KEY, [...all, ...copies]);
    return copies;
};

/* ---------------- MIGRATION ---------------- */

export const guestHasData = (): boolean => read(GOALS_KEY).length > 0;

export const guestClear = (): void => {
    if (!isBrowser) return;
    try {
        localStorage.removeItem(GOALS_KEY);
    } catch {
        /* ignore */
    }
};
