import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'https://newcastlewildcats.co.uk',
    'https://www.newcastlewildcats.co.uk',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            const cleanOrigin = origin.replace(/\/$/, '');

            if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error(`CORS blocked for origin: ${origin}`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json());

app.get('/api/connection', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} environment`);
});