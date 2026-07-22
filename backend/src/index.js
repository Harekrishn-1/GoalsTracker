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

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
        await Promise.all([main(), redisClient.connect()]);
        console.log('DB and Redis connected');

        app.listen(process.env.PORT || 3000, () => {
            console.log('Server listening on port', process.env.PORT || 3000);
        });
    } catch (err) {
        console.log('Startup error:', err.message);
        process.exit(1);
    }
};

InitializeConnection();
