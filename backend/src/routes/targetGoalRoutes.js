const express = require('express');
const targetGoalRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {
    getTargetGoals,
    createTargetGoal,
    updateTargetGoal,
    deleteTargetGoal,
    checkAndSendReminders
} = require('../controllers/targetGoalController');

// Automated cron endpoint (Can be pinged by cron-job.org with secret header or query)
targetGoalRouter.get('/cron/send-reminders', checkAndSendReminders);
targetGoalRouter.post('/cron/send-reminders', checkAndSendReminders);

// User-protected CRUD routes
targetGoalRouter.use(userMiddleware);

targetGoalRouter.get('/', getTargetGoals);
targetGoalRouter.post('/', createTargetGoal);
targetGoalRouter.patch('/:id', updateTargetGoal);
targetGoalRouter.delete('/:id', deleteTargetGoal);

module.exports = targetGoalRouter;
