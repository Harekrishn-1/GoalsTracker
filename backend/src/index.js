require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const main = require('./config/db');
const redisClient = require('./config/redis');

const authRouter = require('./routes/userAuth');
const goalRouter = require('./routes/goalRoutes');
const adminRouter = require('./routes/adminRoutes');

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/user', authRouter);
app.use('/goal', goalRouter);
app.use('/admin', adminRouter);

const InitializeConnection = async () => {
    try {
        await main();
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.log('MongoDB startup error:', err.message);
        process.exit(1);
    }

    try {
        await redisClient.connect();
        console.log('Redis connected successfully');
    } catch (err) {
        console.log('Redis startup warning (server will run without cache):', err.message);
    }

    app.listen(process.env.PORT || 3000, () => {
        console.log('Server listening on port', process.env.PORT || 3000);
    });
};

InitializeConnection();
