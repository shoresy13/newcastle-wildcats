import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

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