import { Goal, GoalCategory, TargetGoal } from '../types';

// Guest ka saara data yahan rehta hai. Login ke baad ye backend pe migrate
// ho jaata hai aur localStorage clear kar dete hain.

const GOALS_KEY = 'streakly_guest_goals';
const TARGET_GOALS_KEY = 'streakly_guest_target_goals';

const isBrowser = typeof window !== 'undefined';

const read = <T>(key: string): T[] => {
    if (!isBrowser) return [];
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const write = <T>(key: string, value: T[]): void => {
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
    const all = read<Goal>(GOALS_KEY);
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
    const all = read<Goal>(GOALS_KEY);
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
    const all = read<Goal>(GOALS_KEY);
    const idx = all.findIndex((g) => g._id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    write(GOALS_KEY, all);
    return all[idx];
};

export const guestSubmitDay = (date: string): Goal[] => {
    const all = read<Goal>(GOALS_KEY);
    for (const g of all) {
        if (g.date === date) g.submitted = true;
    }
    write(GOALS_KEY, all);
    return all.filter((g) => g.date === date);
};

export const guestDeleteGoal = (id: string): void => {
    write(GOALS_KEY, read<Goal>(GOALS_KEY).filter((g) => g._id !== id));
};

export const guestCopyGoals = (fromDate: string, toDate: string, goalIds: string[]): Goal[] => {
    const all = read<Goal>(GOALS_KEY);
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

export const guestReorderGoals = (orderedGoals: Goal[]): void => {
    const all = read<Goal>(GOALS_KEY);
    const orderedIds = new Set(orderedGoals.map((g) => g._id));
    const others = all.filter((g) => !orderedIds.has(g._id));
    write(GOALS_KEY, [...others, ...orderedGoals]);
};

/* ---------------- TARGET / FUTURE GOALS ---------------- */

export const guestGetTargetGoals = (): TargetGoal[] => {
    return read<TargetGoal>(TARGET_GOALS_KEY);
};

export const guestCreateTargetGoal = ({
    title,
    category,
    deadline,
    progress,
    remindersEnabled,
    notes
}: {
    title: string;
    category?: GoalCategory;
    deadline: string;
    progress?: number;
    remindersEnabled?: boolean;
    notes?: string;
}): TargetGoal => {
    const all = read<TargetGoal>(TARGET_GOALS_KEY);
    const prog = Number(progress) || 0;
    const target: TargetGoal = {
        _id: tempId(),
        title,
        category: category || 'Personal',
        deadline,
        progress: prog,
        status: prog >= 100 ? 'completed' : prog > 0 ? 'in_progress' : 'pending',
        remindersEnabled: remindersEnabled !== undefined ? remindersEnabled : true,
        notes: notes || '',
        createdAt: new Date().toISOString()
    };
    all.push(target);
    write(TARGET_GOALS_KEY, all);
    return target;
};

export const guestUpdateTargetGoal = (id: string, updates: Partial<TargetGoal>): TargetGoal | null => {
    const all = read<TargetGoal>(TARGET_GOALS_KEY);
    const idx = all.findIndex((t) => t._id === id);
    if (idx === -1) return null;

    const current = all[idx];
    const updated = { ...current, ...updates };

    if (updates.progress !== undefined) {
        const p = Math.min(100, Math.max(0, Number(updates.progress)));
        updated.progress = p;
        updated.status = p >= 100 ? 'completed' : p > 0 ? 'in_progress' : 'pending';
    }

    all[idx] = updated;
    write(TARGET_GOALS_KEY, all);
    return all[idx];
};

export const guestDeleteTargetGoal = (id: string): void => {
    write(TARGET_GOALS_KEY, read<TargetGoal>(TARGET_GOALS_KEY).filter((t) => t._id !== id));
};

/* ---------------- MIGRATION ---------------- */

export const guestHasData = (): boolean => read(GOALS_KEY).length > 0 || read(TARGET_GOALS_KEY).length > 0;

export const guestClear = (): void => {
    if (!isBrowser) return;
    try {
        localStorage.removeItem(GOALS_KEY);
        localStorage.removeItem(TARGET_GOALS_KEY);
    } catch {
        /* ignore */
    }
};
