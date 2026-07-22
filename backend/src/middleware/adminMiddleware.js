// userMiddleware ke baad chalta hai — req.result mein user already hai.
// Bas role check karta hai.
const adminMiddleware = (req, res, next) => {
    try {
        if (!req.result || req.result.role !== 'admin')
            return res.status(403).json({ message: 'Admin access only' });

        next();
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

module.exports = adminMiddleware;
