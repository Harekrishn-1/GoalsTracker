// Guest ka saara data yahan rehta hai. Login ke baad ye backend pe migrate
// ho jaata hai aur localStorage clear kar dete hain.

const GOALS_KEY = 'streakly_guest_goals';

const read = (key) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const write = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage full / private mode — chup-chaap ignore
    }
};

// Guest ke liye temporary id
const tempId = () => `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/* ---------------- GOALS ---------------- */

export const guestGetGoals = (date) => {
    const all = read(GOALS_KEY);
    return date ? all.filter((g) => g.date === date) : all;
};

export const guestCreateGoal = ({ title, category, date, progress, startTime, endTime }) => {
    const all = read(GOALS_KEY);
    const goal = {
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

export const guestUpdateGoal = (id, updates) => {
    const all = read(GOALS_KEY);
    const idx = all.findIndex((g) => g._id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    write(GOALS_KEY, all);
    return all[idx];
};

export const guestSubmitDay = (date) => {
    const all = read(GOALS_KEY);
    for (const g of all) if (g.date === date) g.submitted = true;
    write(GOALS_KEY, all);
    return all.filter((g) => g.date === date);
};

export const guestDeleteGoal = (id) => {
    write(GOALS_KEY, read(GOALS_KEY).filter((g) => g._id !== id));
};

export const guestCopyGoals = (fromDate, toDate, goalIds) => {
    const all = read(GOALS_KEY);
    let source = all.filter((g) => g.date === fromDate);
    if (Array.isArray(goalIds) && goalIds.length)
        source = source.filter((g) => goalIds.includes(g._id));

    const copies = source.map((g) => ({
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

export const guestHasData = () => read(GOALS_KEY).length > 0;

export const guestClear = () => {
    try {
        localStorage.removeItem(GOALS_KEY);
    } catch { /* ignore */ }
};
