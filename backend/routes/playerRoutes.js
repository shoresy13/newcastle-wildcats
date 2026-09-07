import express from 'express';
import Player from '../models/Player.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const getProfilePicUrl = (buihaLink) => {
    if (!buihaLink) return '';
    const match = buihaLink.match(/\/player\/(\d+)/);
    if (match && match[1]) {
        return `https://buiha.org.uk/assets/img/profile/15/player-${match[1]}.jpg`;
    }
    return '';
};

router.get('/', async (req, res) => {
    try {
        const players = await Player.find({}).sort({ number: 1 });
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ message: 'Server error while fetching players' });
    }
});

router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, number, team, position, buihaLink } = req.body;

        if (!name || !number) {
            return res.status(400).json({ message: 'Name and number are required' });
        }

        const profilePic = getProfilePicUrl(buihaLink);

        const newPlayer = new Player({
            name: name.toUpperCase(),
            number,
            team: team ? team.toUpperCase() : '',
            position: position ? position.toUpperCase() : '-',
            buihaLink: buihaLink || '',
            profilePic
        });

        const savedPlayer = await newPlayer.save();
        res.status(201).json(savedPlayer);
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, number, team, position, buihaLink } = req.body;

        const updatedFields = {
            name: name ? name.toUpperCase() : undefined,
            number,
            team: team !== undefined ? team.toUpperCase() : undefined,
            position: position ? position.toUpperCase() : undefined,
            buihaLink: buihaLink !== undefined ? buihaLink : undefined,
            profilePic: buihaLink !== undefined ? getProfilePicUrl(buihaLink) : undefined
        };

        Object.keys(updatedFields).forEach(key => updatedFields[key] === undefined && delete updatedFields[key]);

        const updatedPlayer = await Player.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }

        res.json(updatedPlayer);
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        await player.deleteOne();
        res.json({ message: 'Player removed successfully' });
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ message: 'Server error while deleting player' });
    }
});

export default router;