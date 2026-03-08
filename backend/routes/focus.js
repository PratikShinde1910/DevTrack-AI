const express = require('express');
const FocusSession = require('../models/FocusSession');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/focus — Save a completed focus session
router.post('/', async (req, res) => {
    try {
        const { duration, completed, sessionName } = req.body;

        if (duration === undefined || duration === null) {
            return res.status(400).json({ message: 'Duration is required' });
        }

        const focusSession = await FocusSession.create({
            userId: req.user.id,
            sessionName: sessionName || 'Focus Session',
            duration,
            completed: completed !== undefined ? completed : true,
            createdAt: new Date(),
        });

        res.status(201).json(focusSession);
    } catch (error) {
        console.error('Error saving focus session:', error);
        res.status(500).json({ message: 'Server error saving focus session' });
    }
});

// Optional: GET /api/focus — Get all focus sessions for the user
router.get('/', async (req, res) => {
    try {
        const sessions = await FocusSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
