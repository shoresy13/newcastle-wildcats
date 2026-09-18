import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true, default: '' },
    author: { type: String, default: 'Newcastle Wildcats' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    content: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('News', NewsSchema);