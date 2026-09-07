import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    division: { type: String, default: 'Unregistered' },
    description: { type: String, default: '' },
    captain: { type: [String], default: [] },
    assistantCaptains: { type: [String], default: [] },
    coaches: { type: [String], default: [] },
    roster: [{
        playerId: { type: String },
        name: { type: String },
        number: { type: Number },
        position: { type: String, default: '-' }
    }]
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);