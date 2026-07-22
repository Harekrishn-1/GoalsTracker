const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token)
            throw new Error('Token not present');

        const payload = jwt.verify(token, process.env.JWT_KEY);

        const { _id } = payload;
        if (!_id)
            throw new Error('Invalid token');

        const result = await User.findById(_id);
        if (!result)
            throw new Error('User does not exist');

        // logout ke baad token blocklist mein chala jaata hai
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked)
            throw new Error('Token is blocked');

        // Activity track — din mein ek baar update kaafi hai (admin stats ke liye)
        const now = Date.now();
        const last = result.lastActiveAt ? result.lastActiveAt.getTime() : 0;
        if (now - last > 60 * 1000) {
            result.lastActiveAt = new Date();
            result.save().catch(() => {});   // fail ho to request na ruke
        }

        req.result = result;   // aage ke controllers isse userId lete hain
        next();
    } catch (err) {
        res.status(401).send('Error: ' + err.message);
    }
};

module.exports = userMiddleware;
