import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const [, , email, password, isAdminArg] = process.argv;

if (!email || !password) {
    console.error('Usage: node createUser.js <email> <password> [isAdmin]');
    console.error('Example: node createUser.js testuser@example.com testpassword true');
    process.exit(1);
}

const isAdmin = isAdminArg === 'true';

const createAccount = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.error(`Error: User with email "${email}" already exists.`);
            process.exit(1);
        }

        await User.create({
            email,
            password,
            isAdmin,
        });

        console.log(`Success: User created! (${email} | Admin: ${isAdmin})`);
    } catch (error) {
        console.error('Failed to create account:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAccount();