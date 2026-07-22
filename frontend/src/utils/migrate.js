import axiosClient from './axiosClient';
import { guestGetGoals, guestHasData, guestClear } from './guestStorage';

// Login/signup ke turant baad chalta hai.
// localStorage ka data backend pe bhejta hai, phir localStorage saaf.
export const migrateGuestData = async () => {
    if (!guestHasData()) return { goals: 0 };

    const goals = guestGetGoals();

    let migratedGoals = 0;

    try {
        if (goals.length) {
            const res = await axiosClient.post('/goal/migrate', {
                goals: goals.map((g) => ({
                    title: g.title,
                    category: g.category,
                    date: g.date,
                    progress: g.progress
                }))
            });
            migratedGoals = res.data?.length || 0;
        }

        // Sirf success pe clear karo — warna user ka data gayab ho jayega
        guestClear();
    } catch (err) {
        console.error('Migration failed, keeping local data:', err);
    }

    return { goals: migratedGoals };
};
