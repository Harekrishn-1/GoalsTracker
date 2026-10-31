const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        connectTimeout: 3000, // 3 seconds timeout
        reconnectStrategy: (retries) => {
            // Max 2-3 retries to prevent endless hanging
            if (retries >= 3) {
                console.log('Redis reconnection stopped: max retries reached');
                return false; // stops reconnection
            }
            return Math.min(retries * 500, 1000);
        }
    }
});

redisClient.on('error', (err) => console.log('Redis Error:', err.message));

module.exports = redisClient;
