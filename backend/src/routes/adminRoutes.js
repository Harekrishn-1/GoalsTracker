const express = require('express');
const adminRouter = express.Router();

const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getStats } = require('../controllers/adminController');

// Pehle valid user, phir admin role — dono guards
adminRouter.get('/stats', userMiddleware, adminMiddleware, getStats);

module.exports = adminRouter;
