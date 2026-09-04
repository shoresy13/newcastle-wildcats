import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    gameType: { type: String, required: true },
    status: { type: String, enum: ['UPCOMING', 'FINAL'], default: 'UPCOMING' },
    venue: { type: String, default: '' },
    homeTeam: {
        name: { type: String, required: true },
        shortName: { type: String, required: true },
        logo: { type: String, default: '' },
        teamLetter: { type: String, default: 'A' },
        score: { type: Number, default: 0 }
    },
    awayTeam: {
        name: { type: String, required: true },
        shortName: { type: String, required: true },
        logo: { type: String, default: '' },
        teamLetter: { type: String, default: 'A' },
        score: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);