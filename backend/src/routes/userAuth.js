const express = require('express');
const authRouter = express.Router();

const { register, login, logout, checkAuth } = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.get('/check', userMiddleware, checkAuth);

module.exports = authRouter;
