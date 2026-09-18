import express from 'express';
import News from '../models/News.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const articles = await News.find().sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).json({ message: 'Server error fetching news' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newArticle = new News(req.body);
        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (err) {
        console.error('Error creating news article:', err);
        res.status(500).json({ message: 'Server error creating article' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedArticle = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedArticle) return res.status(404).json({ message: 'Article not found' });
        res.json(updatedArticle);
    } catch (err) {
        console.error('Error updating news article:', err);
        res.status(500).json({ message: 'Server error updating article' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedArticle = await News.findByIdAndDelete(req.params.id);
        if (!deletedArticle) return res.status(404).json({ message: 'Article not found' });
        res.json({ message: 'Article deleted successfully' });
    } catch (err) {
        console.error('Error deleting news article:', err);
        res.status(500).json({ message: 'Server error deleting article' });
    }
});

export default router;