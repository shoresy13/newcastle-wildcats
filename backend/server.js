import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import User from './models/User.js';
import gameRoutes from './routes/gameRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected Successfully'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

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

app.use('/api/games', gameRoutes);

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.json({
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

app.get('/api/connection', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} environment`);
});