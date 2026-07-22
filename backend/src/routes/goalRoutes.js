const express = require('express');
const goalRouter = express.Router();

const userMiddleware = require('../middleware/userMiddleware');
const {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    submitDay,
    copyGoals,
    migrateGuestGoals
} = require('../controllers/goalController');

// saare goal routes protected — guest ka data localStorage mein rehta hai,
// server tak aata hi nahi jab tak login na ho
goalRouter.use(userMiddleware);

goalRouter.get('/', getGoals);
goalRouter.post('/', createGoal);
goalRouter.post('/submit', submitDay);
goalRouter.post('/copy', copyGoals);
goalRouter.post('/migrate', migrateGuestGoals);
goalRouter.patch('/:id', updateGoal);
goalRouter.delete('/:id', deleteGoal);

module.exports = goalRouter;
