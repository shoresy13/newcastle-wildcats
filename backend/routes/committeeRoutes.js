import express from 'express';
import Committee from '../models/Committee.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const committeeDoc = await Committee.findOne();
        if (!committeeDoc) {
            return res.json([]);
        }
        res.json(committeeDoc.members);
    } catch (err) {
        console.error('Error fetching committee:', err);
        res.status(500).json({ message: 'Server error fetching committee' });
    }
});

router.put('/', async (req, res) => {
    try {
        const newMembers = req.body;

        let committeeDoc = await Committee.findOne();
        if (!committeeDoc) {
            committeeDoc = new Committee({ members: newMembers });
        } else {
            committeeDoc.members = newMembers;
        }

        await committeeDoc.save();
        res.json({ message: 'Committee updated successfully', members: committeeDoc.members });
    } catch (err) {
        console.error('Error updating committee:', err);
        res.status(500).json({ message: 'Server error updating committee' });
    }
});

export default router;