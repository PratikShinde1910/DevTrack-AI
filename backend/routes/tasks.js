const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /tasks — Get all tasks for the logged-in user for the current day
router.get('/', async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Fetch tasks for today. We could also fetched ALL tasks and filter on frontend, 
        // but for "Today's Tasks", backend filtering is cleaner.
        const tasks = await Task.find({
            userId: req.user.id,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /tasks — Create a new task
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        const task = await Task.create({
            userId: req.user.id,
            title,
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /tasks/:id — Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.completed = !task.completed;
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /tasks/:id — Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
