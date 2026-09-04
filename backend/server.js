import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// TESTING THE LOGIN STUFF
const mockAdminUser = {
    id: "admin_1",
    email: "test@user.com",
    passwordHash: bcrypt.hashSync("testpassword", 10),
    isAdmin: true,
};

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (email !== mockAdminUser.email) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, mockAdminUser.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
        { id: mockAdminUser.id, isAdmin: mockAdminUser.isAdmin },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );

    res.json({
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        isAdmin: mockAdminUser.isAdmin,
        token: token,
    });
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