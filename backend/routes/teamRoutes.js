import express from 'express';
import Team from '../models/Team.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const teams = await Team.find({}).sort({ id: 1 });
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ message: 'Server error while fetching teams' });
    }
});

router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, division, description, captain, assistantCaptains, coaches, roster } = req.body;

        const identifier = req.params.id;

        const query = identifier.length === 24 ? { _id: identifier } : { id: identifier.toUpperCase() };

        const updatedFields = {
            name: name ? name.toUpperCase() : undefined,
            division: division ? division.toUpperCase() : undefined,
            description: description !== undefined ? description : undefined,
            captain: captain !== undefined ? captain : undefined,
            assistantCaptains: assistantCaptains !== undefined ? assistantCaptains : undefined,
            coaches: coaches !== undefined ? coaches : undefined,
            roster: roster !== undefined ? roster : undefined
        };

        Object.keys(updatedFields).forEach(key => updatedFields[key] === undefined && delete updatedFields[key]);

        const updatedTeam = await Team.findOneAndUpdate(
            query,
            { $set: updatedFields },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json(updatedTeam);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(400).json({ message: error.message });
    }
});

export default router;