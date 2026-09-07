import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true, uppercase: true },
    number: { type: Number, required: true },
    buihaLink: { type: String, default: '' },
    profilePic: { type: String, default: '' }
}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);
export default Player;