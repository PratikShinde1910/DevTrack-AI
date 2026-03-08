const express = require('express');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/insights/weekly — Get insights based on the current week's coding activity
router.get('/weekly', async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the start of the current week (Monday) and end of week (Sunday)
        const curr = new Date();
        const day = curr.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday

        const startOfWeek = new Date(curr.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Fetch progress entries for this week
        const weeklyEntries = await Progress.find({
            userId,
            date: { $gte: startOfWeek, $lte: endOfWeek }
        }).sort({ date: 1 });

        // Calculate total hours
        const totalHours = weeklyEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

        // Find top technology
        const techCounts = {};
        weeklyEntries.forEach(entry => {
            if (entry.techLearned) {
                // Handle both new array format and legacy comma-separated string
                const techs = Array.isArray(entry.techLearned)
                    ? entry.techLearned
                    : entry.techLearned.split(',').map(t => t.trim()).filter(Boolean);

                techs.forEach(tech => {
                    techCounts[tech] = (techCounts[tech] || 0) + 1;
                });
            }
        });

        let topTechnology = 'None';
        let maxCount = 0;
        for (const [tech, count] of Object.entries(techCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topTechnology = tech;
            }
        }

        // Find most productive day
        const dayHours = {
            'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
            'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0
        };

        const daysOfWeekStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        weeklyEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            const dayName = daysOfWeekStr[entryDate.getDay()];
            dayHours[dayName] += (entry.hours || 0);
        });

        let peakDay = 'None';
        let maxDailyHours = 0;
        for (const [dayName, hours] of Object.entries(dayHours)) {
            if (hours > maxDailyHours) {
                maxDailyHours = hours;
                peakDay = dayName;
            }
        }

        res.json({
            totalHours: Math.round(totalHours * 10) / 10,
            topTechnology,
            peakDay
        });

    } catch (error) {
        console.error('Error fetching weekly insights:', error);
        res.status(500).json({ message: 'Server error fetching insights' });
    }
});

module.exports = router;
