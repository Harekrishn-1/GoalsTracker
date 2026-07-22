const Goal = require('../models/goal');

// GET /goal?date=2026-07-21   (date optional — na ho to saare goals)
const getGoals = async (req, res) => {
    try {
        const userId = req.result._id;
        const { date } = req.query;

        // userId hamesha filter mein — isi se user A, user B ka data nahi dekh sakta
        const filter = { userId };
        if (date) filter.date = date;

        const goals = await Goal.find(filter).sort({ createdAt: 1 });
        res.status(200).json(goals);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};

const createGoal = async (req, res) => {
    try {
        const userId = req.result._id;
        const { title, category, date, progress, startTime, endTime } = req.body;

        if (!title || !date)
            throw new Error('Title and date are required');

        const goal = await Goal.create({
            userId,
            title,
            category: category || 'Personal',
            startTime: startTime || '',
            endTime: endTime || '',
            date,
            progress: progress || 0
        });

        res.status(201).json(goal);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

const updateGoal = async (req, res) => {
    try {
        const userId = req.result._id;
        const { id } = req.params;
        const { title, category, progress, submitted, startTime, endTime } = req.body;

        // Submit hone ke baad goal locked — koi edit nahi
        const existing = await Goal.findOne({ _id: id, userId });
        if (!existing)
            return res.status(404).send('Goal not found');
        if (existing.submitted)
            return res.status(403).json({ message: 'This day is submitted and locked' });

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (category !== undefined) updates.category = category;
        if (startTime !== undefined) updates.startTime = startTime;
        if (endTime !== undefined) updates.endTime = endTime;
        if (progress !== undefined) updates.progress = progress;
        if (submitted !== undefined) updates.submitted = submitted;

        // findOneAndUpdate mein userId bhi — warna koi bhi doosre ka goal id
        // bhej kar edit kar sakta hai (IDOR vulnerability)
        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!goal)
            return res.status(404).send('Goal not found');

        res.status(200).json(goal);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

const deleteGoal = async (req, res) => {
    try {
        const userId = req.result._id;
        const { id } = req.params;

        const existing = await Goal.findOne({ _id: id, userId });
        if (!existing)
            return res.status(404).send('Goal not found');
        if (existing.submitted)
            return res.status(403).json({ message: 'This day is submitted and locked' });

        await Goal.deleteOne({ _id: id, userId });
        res.status(200).send('Goal deleted');
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

// POST /goal/submit  { date }
// Us din ke saare goals ko submitted mark karta hai
const submitDay = async (req, res) => {
    try {
        const userId = req.result._id;
        const { date } = req.body;

        if (!date)
            throw new Error('Date is required');

        await Goal.updateMany({ userId, date }, { submitted: true });

        const goals = await Goal.find({ userId, date });
        res.status(200).json(goals);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

// POST /goal/copy  { fromDate, toDate }
const copyGoals = async (req, res) => {
    try {
        const userId = req.result._id;
        const { fromDate, toDate, goalIds } = req.body;

        if (!fromDate || !toDate)
            throw new Error('fromDate and toDate are required');

        // goalIds diye ho to sirf wahi copy karo (modal se selected)
        const filter = { userId, date: fromDate };
        if (Array.isArray(goalIds) && goalIds.length) filter._id = { $in: goalIds };

        const source = await Goal.find(filter);

        if (source.length === 0)
            return res.status(404).send('No goals found on that date');

        const copies = source.map((g) => ({
            userId,
            title: g.title,
            category: g.category,
            startTime: g.startTime,
            endTime: g.endTime,
            date: toDate,
            progress: 0,
            submitted: false
        }));

        const created = await Goal.insertMany(copies);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

// POST /goal/migrate  { goals: [...] }
// Guest ne localStorage mein jo banaya tha, login ke baad wo yahan aata hai
const migrateGuestGoals = async (req, res) => {
    try {
        const userId = req.result._id;
        const { goals } = req.body;

        if (!Array.isArray(goals) || goals.length === 0)
            return res.status(200).json([]);

        // Duplicate se bachne ke liye: jo (title + date) already hai, use skip
        const existing = await Goal.find({ userId }).select('title date');
        const seen = new Set(existing.map((g) => `${g.title}|${g.date}`));

        const fresh = goals
            .filter((g) => g.title && g.date && !seen.has(`${g.title}|${g.date}`))
            .map((g) => ({
                userId,
                title: g.title,
                category: g.category || 'Personal',
                startTime: g.startTime || '',
                endTime: g.endTime || '',
                date: g.date,
                progress: g.progress || 0,
                submitted: false
            }));

        if (fresh.length === 0)
            return res.status(200).json([]);

        const created = await Goal.insertMany(fresh);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
};

module.exports = {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    submitDay,
    copyGoals,
    migrateGuestGoals
};
