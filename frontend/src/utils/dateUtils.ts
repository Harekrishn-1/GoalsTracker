export const toKey = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const parseKey = (key: string): Date => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const shiftDays = (key: string, n: number): string => {
    const d = parseKey(key);
    d.setDate(d.getDate() + n);
    return toKey(d);
};

export const todayKey = (): string => toKey(new Date());

export const dayOfWeek = (key: string): number => parseKey(key).getDay();

export const prettyDate = (key: string): string =>
    parseKey(key).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short'
    });

// '06:00' -> '6am', '18:30' -> '6:30pm'
export const formatTime = (t?: string): string => {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    let h = Number(hStr);
    const m = Number(mStr);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    return m === 0 ? `${h}${ampm}` : `${h}:${String(m).padStart(2, '0')}${ampm}`;
};

// Dono time ho to '6am - 8am', ek ho to bas wahi
export const formatTimeRange = (start?: string, end?: string): string => {
    const s = formatTime(start);
    const e = formatTime(end);
    if (s && e) return `${s} - ${e}`;
    return s || e || '';
};
