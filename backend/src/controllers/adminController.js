const User = require('../models/user');
const Goal = require('../models/goal');

// Sirf aggregate counts. Kisi user ke goals ka content nahi.
const getStats = async (req, res) => {
    try {
        const now = new Date();

        // "Active today" = jinhone aaj (last 24h) kuch kiya
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // countDocuments — sirf ginti, data load nahi hota
        const [totalUsers, activeToday, activeThisWeek, totalGoals, newThisWeek] =
            await Promise.all([
                User.countDocuments({}),
                User.countDocuments({ lastActiveAt: { $gte: dayAgo } }),
                User.countDocuments({ lastActiveAt: { $gte: weekAgo } }),
                Goal.countDocuments({}),
                User.countDocuments({ createdAt: { $gte: weekAgo } })
            ]);

        const goalsCompleted = await Goal.countDocuments({ progress: 100 });
        const completionRate = totalGoals
            ? Math.round((goalsCompleted / totalGoals) * 100)
            : 0;

        res.status(200).json({
            totalUsers,
            activeToday,
            activeThisWeek,
            newThisWeek,
            totalGoals,
            goalsCompleted,
            completionRate
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getStats };
