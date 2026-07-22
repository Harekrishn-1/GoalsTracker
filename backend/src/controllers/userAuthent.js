const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

// cookie ki settings ek jagah — production mein secure+sameSite chahiye
const cookieOptions = {
    httpOnly: true,                                  // JS se cookie padhi na ja sake (XSS protection)
    secure: process.env.NODE_ENV === 'production',   // production mein sirf HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000                           // 1 ghanta
};

const register = async (req, res) => {
    try {
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        const exists = await User.findOne({ emailId });
        if (exists)
            return res.status(409).json({ message: 'This email is already registered. Try logging in instead.' });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            emailId,
            password: hashed,
            role: 'user'
        });

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: 'user' },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                emailId: user.emailId,
                role: user.role
            },
            message: 'Registered successfully'
        });
    } catch (err) {
        // validator ke messages seedhe bhejo, "Error:" prefix ke bina
        res.status(400).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password)
            throw new Error('Please enter both email and password');

        const user = await User.findOne({ emailId });

        // NOTE: user null ho to bcrypt.compare crash karta hai — pehle check
        // Aur "user nahi mila" vs "password galat" ka alag message nahi dete,
        // warna attacker ko pata chal jaata hai ki email registered hai ya nahi.
        if (!user)
            throw new Error('Invalid credentials');

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            throw new Error('Invalid credentials');

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 1000,
});

        res.status(200).json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                emailId: user.emailId,
                role: user.role
            },
            message: 'Logged in successfully'
        });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (token) {
            const payload = jwt.decode(token);

            // Token ko blocklist mein daala — JWT stateless hota hai, server-side
            // "invalidate" karne ka yahi tareeka hai. TTL = token ki apni expiry,
            // uske baad Redis khud key hata dega (memory waste nahi hoti).
            await redisClient.set(`token:${token}`, 'Blocked');
            await redisClient.expireAt(`token:${token}`, payload.exp);
        }

        res.cookie('token', null, { ...cookieOptions, maxAge: 0 });
        res.status(200).send('Logged out successfully');
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
};

// Frontend page load pe ise call karta hai — cookie valid hai ya nahi
const checkAuth = async (req, res) => {
    try {
        const user = req.result;
        res.status(200).json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                emailId: user.emailId,
                role: user.role
            },
            message: 'Valid user'
        });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

module.exports = { register, login, logout, checkAuth };
