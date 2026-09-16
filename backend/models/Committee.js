import mongoose from 'mongoose';

const CommitteeMemberSchema = new mongoose.Schema({
    role: { type: String, required: true },
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    instagram: { type: String, default: '' }
});

const CommitteeSchema = new mongoose.Schema({
    members: [CommitteeMemberSchema]
}, { timestamps: true });

const Committee = mongoose.model('Committee', CommitteeSchema);

export default Committee;