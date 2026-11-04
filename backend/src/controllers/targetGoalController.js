const TargetGoal = require('../models/targetGoal');
const User = require('../models/user');
const { sendGoalReminderEmail } = require('../utils/mailer');

const toKey = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const shiftDays = (d, n) => {
    const date = new Date(d);
    date.setDate(date.getDate() + n);
    return toKey(date);
};

// GET /target-goal - Get all target goals for current user
const getTargetGoals = async (req, res) => {
    try {
        const userId = req.result._id;
        const targets = await TargetGoal.find({ userId }).sort({ deadline: 1, createdAt: -1 });
        res.status(200).json(targets);
    } catch (err) {
        res.status(500).json({ message: 'Error loading targets: ' + err.message });
    }
};

// POST /target-goal - Create new target goal
const createTargetGoal = async (req, res) => {
    try {
        const userId = req.result._id;
        const { title, category, deadline, progress, remindersEnabled, notes } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Goal title is required' });
        }
        if (!deadline) {
            return res.status(400).json({ message: 'Target deadline date is required' });
        }

        const target = await TargetGoal.create({
            userId,
            title: title.trim(),
            category: category || 'Personal',
            deadline,
            progress: Number(progress) || 0,
            status: Number(progress) >= 100 ? 'completed' : Number(progress) > 0 ? 'in_progress' : 'pending',
            remindersEnabled: remindersEnabled !== undefined ? Boolean(remindersEnabled) : true,
            notes: notes || ''
        });

        res.status(201).json(target);
    } catch (err) {
        res.status(400).json({ message: 'Error creating target: ' + err.message });
    }
};

// PATCH /target-goal/:id - Update target goal
const updateTargetGoal = async (req, res) => {
    try {
        const userId = req.result._id;
        const { id } = req.params;
        const { title, category, deadline, progress, remindersEnabled, notes } = req.body;

        const target = await TargetGoal.findOne({ _id: id, userId });
        if (!target) {
            return res.status(404).json({ message: 'Target goal not found' });
        }

        if (title !== undefined) target.title = title.trim();
        if (category !== undefined) target.category = category;
        if (deadline !== undefined) target.deadline = deadline;
        if (notes !== undefined) target.notes = notes;
        if (remindersEnabled !== undefined) target.remindersEnabled = Boolean(remindersEnabled);

        if (progress !== undefined) {
            const num = Math.min(100, Math.max(0, Number(progress)));
            target.progress = num;
            if (num === 100) target.status = 'completed';
            else if (num > 0) target.status = 'in_progress';
            else target.status = 'pending';
        }

        await target.save();
        res.status(200).json(target);
    } catch (err) {
        res.status(400).json({ message: 'Error updating target: ' + err.message });
    }
};

// DELETE /target-goal/:id - Delete target goal
const deleteTargetGoal = async (req, res) => {
    try {
        const userId = req.result._id;
        const { id } = req.params;

        const deleted = await TargetGoal.findOneAndDelete({ _id: id, userId });
        if (!deleted) {
            return res.status(404).json({ message: 'Target goal not found' });
        }

        res.status(200).json({ message: 'Target goal deleted successfully', id });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting target: ' + err.message });
    }
};

// POST /target-goal/cron/send-reminders - Automated cron check endpoint
const checkAndSendReminders = async (req, res) => {
    try {
        // Protect cron endpoint with CRON_SECRET if configured
        const cronSecret = process.env.CRON_SECRET;
        const providedSecret = req.headers['x-cron-secret'] || req.query.secret;

        if (cronSecret && providedSecret !== cronSecret) {
            return res.status(401).json({ message: 'Unauthorized cron request' });
        }

        const now = new Date();
        const todayStr = toKey(now);
        const tomorrowStr = shiftDays(now, 1);
        const twoDaysStr = shiftDays(now, 2);

        // Find uncompleted target goals whose deadline is today, tomorrow, or in 2 days
        const targetGoals = await TargetGoal.find({
            remindersEnabled: true,
            progress: { $lt: 100 },
            deadline: { $in: [todayStr, tomorrowStr, twoDaysStr] }
        }).populate('userId', 'firstName emailId');

        let sentCount = 0;
        const results = [];

        for (const goal of targetGoals) {
            if (!goal.userId || !goal.userId.emailId) continue;

            let shouldSend = false;
            let daysLeft = 0;

            if (goal.deadline === twoDaysStr && !goal.remindersSent.twoDay) {
                shouldSend = true;
                daysLeft = 2;
                goal.remindersSent.twoDay = true;
            } else if (goal.deadline === tomorrowStr && !goal.remindersSent.oneDay) {
                shouldSend = true;
                daysLeft = 1;
                goal.remindersSent.oneDay = true;
            } else if (goal.deadline === todayStr && !goal.remindersSent.zeroDay) {
                shouldSend = true;
                daysLeft = 0;
                goal.remindersSent.zeroDay = true;
            }

            if (shouldSend) {
                const mailRes = await sendGoalReminderEmail({
                    to: goal.userId.emailId,
                    userName: goal.userId.firstName,
                    goalTitle: goal.title,
                    category: goal.category,
                    deadline: goal.deadline,
                    daysLeft,
                    progress: goal.progress
                });

                await goal.save();
                sentCount++;
                results.push({ goalId: goal._id, to: goal.userId.emailId, daysLeft, success: mailRes.success });
            }
        }

        res.status(200).json({
            message: `Processed ${targetGoals.length} candidate goals. Sent ${sentCount} reminders.`,
            sentCount,
            results
        });
    } catch (err) {
        console.error('Error in reminder cron:', err.message);
        res.status(500).json({ message: 'Error processing reminders: ' + err.message });
    }
};

// POST /target-goal/test-email - Send an instant test reminder email to logged-in user
const sendTestEmail = async (req, res) => {
    try {
        const user = await User.findById(req.result._id);
        if (!user || !user.emailId) {
            return res.status(400).json({ message: 'User email not found' });
        }

        const mailRes = await sendGoalReminderEmail({
            to: user.emailId,
            userName: user.firstName || 'Goal Tracker User',
            goalTitle: 'Sample Target Goal (Test Email)',
            category: 'Study',
            deadline: toKey(new Date()),
            daysLeft: 1,
            progress: 75
        });

        if (!mailRes.success) {
            return res.status(400).json({
                message: 'Failed to send email via Resend',
                details: mailRes.error || mailRes.reason
            });
        }

        res.status(200).json({
            message: `Test email sent successfully to ${user.emailId}! Check your inbox and spam folder.`,
            id: mailRes.data?.id
        });
    } catch (err) {
        res.status(500).json({ message: 'Error sending test email: ' + err.message });
    }
};

module.exports = {
    getTargetGoals,
    createTargetGoal,
    updateTargetGoal,
    deleteTargetGoal,
    checkAndSendReminders,
    sendTestEmail
};
