import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary-v2';

import User from './models/User.js';
import gameRoutes from './routes/gameRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import committeeRoutes from "./routes/committeeRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected Successfully'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'newcastle-wildcats-committee',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
    },
});

const upload = multer({ storage: storage });

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
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/committee', committeeRoutes);

app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ error: 'Image upload failed' });
        }
        res.json({ url: req.file.path });
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

app.get('/api/standings/:divisionId', async (req, res) => {
    try {
        const { divisionId } = req.params;
        const response = await fetch(`https://api.buiha.org.uk/division/${divisionId}/standings/`);
        if (!response.ok) throw new Error('Failed to fetch standings from BUIHA');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error proxying BUIHA standings:', error);
        res.status(500).json({ message: 'Error fetching division standings' });
    }
});

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