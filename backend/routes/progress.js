const express = require('express');
const Progress = require('../models/Progress');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /progress — Create a new progress entry
router.post('/', async (req, res) => {
    try {
        const { hours, problemsSolved, techLearned, notes, date, projectId } = req.body;

        if (hours === undefined || hours === null) {
            return res.status(400).json({ message: 'Hours coded is required' });
        }

        const progress = await Progress.create({
            userId: req.user.id,
            projectId,
            hours,
            problemsSolved: problemsSolved || 0,
            techLearned: techLearned || '',
            notes: notes || '',
            date: date || new Date(),
        });

        // If associated with a project, increment its totalHours
        if (projectId) {
            await Project.findByIdAndUpdate(projectId, {
                $inc: { totalHours: hours }
            });
        }

        res.status(201).json(progress);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /progress — Get all progress entries for the user
router.get('/', async (req, res) => {
    try {
        const entries = await Progress.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /progress/stats — Get aggregated stats
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all entries sorted by date
        const entries = await Progress.find({ userId }).sort({ date: -1 });

        // Total hours and problems
        const totalHours = entries.reduce((sum, e) => sum + (e.hours || 0), 0);
        const totalProblems = entries.reduce((sum, e) => sum + (e.problemsSolved || 0), 0);

        // Calculate coding streak
        let streak = 0;
        if (entries.length > 0) {
            // Get unique dates (normalize to date-only)
            const uniqueDates = [
                ...new Set(
                    entries.map((e) => {
                        const d = new Date(e.date);
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })
                ),
            ].sort((a, b) => new Date(b) - new Date(a));

            // Check if most recent entry is today or yesterday
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

            if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
                streak = 1;
                for (let i = 1; i < uniqueDates.length; i++) {
                    const curr = new Date(uniqueDates[i - 1]);
                    const prev = new Date(uniqueDates[i]);
                    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // Today's progress
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayEntries = entries.filter((e) => {
            const d = new Date(e.date);
            return d >= todayStart && d <= todayEnd;
        });

        const todayHours = todayEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
        const todayProblems = todayEntries.reduce((sum, e) => sum + (e.problemsSolved || 0), 0);
        const todayTech = todayEntries
            .map((e) => e.techLearned)
            .filter(Boolean)
            .join(', ');

        // Create an array for the 7 days of the week starting from Monday
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        // Find the start of the current week (Monday)
        const curr = new Date();
        const day = curr.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const startOfWeek = new Date(curr.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyActivity = daysOfWeek.map((dayName, index) => {
            const dateForDay = new Date(startOfWeek);
            dateForDay.setDate(startOfWeek.getDate() + index);
            const dateEnd = new Date(dateForDay);
            dateEnd.setHours(23, 59, 59, 999);

            const dayHours = entries
                .filter(e => {
                    const d = new Date(e.date);
                    return d >= dateForDay && d <= dateEnd;
                })
                .reduce((sum, e) => sum + (e.hours || 0), 0);

            return {
                day: dayName,
                hours: Math.round(dayHours * 10) / 10
            };
        });

        res.json({
            totalHours: Math.round(totalHours * 10) / 10,
            totalProblems,
            streak,
            today: {
                hours: Math.round(todayHours * 10) / 10,
                problems: todayProblems,
                techLearned: todayTech,
            },
            weeklyActivity
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /progress/:id — Update a progress entry
router.patch('/:id', async (req, res) => {
    try {
        const { hours, problemsSolved, techLearned, notes } = req.body;

        const progress = await Progress.findOne({ _id: req.params.id, userId: req.user.id });
        if (!progress) {
            return res.status(404).json({ message: 'Progress entry not found' });
        }

        if (hours !== undefined) progress.hours = hours;
        if (problemsSolved !== undefined) progress.problemsSolved = problemsSolved;
        if (techLearned !== undefined) progress.techLearned = techLearned;
        if (notes !== undefined) progress.notes = notes;

        await progress.save();
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /progress/:id — Delete a progress entry
router.delete('/:id', async (req, res) => {
    try {
        const progress = await Progress.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!progress) {
            return res.status(404).json({ message: 'Progress entry not found' });
        }

        res.json({ message: 'Progress entry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
