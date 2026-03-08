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
        const { hours, problemsSolved, techLearned, devLog, date, projectId } = req.body;

        if (hours === undefined || hours === null) {
            return res.status(400).json({ message: 'Hours coded is required' });
        }

        const progress = await Progress.create({
            userId: req.user.id,
            projectId,
            hours,
            problemsSolved: problemsSolved || 0,
            techLearned: techLearned || '',
            devLog: devLog || '',
            date: date || new Date(),
        });

        // If associated with a project, increment its totalHours
        if (projectId) {
            const project = await Project.findOne({ _id: projectId, userId: req.user.id });
            if (!project) {
                // If the project doesn't exist or isn't owned by the user, we should 
                // probably still save the progress but not update any project.
                // However, for strict security and data integrity, we should return an error.
                return res.status(404).json({ message: 'Project not found or unauthorized access' });
            }

            project.totalHours = (project.totalHours || 0) + hours;
            await project.save();
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

        // Calculate coding streaks
        let currentStreak = 0;
        let longestStreak = 0;

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

            let tempStreak = 0;

            if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
                currentStreak = 1;
                tempStreak = 1;
                longestStreak = 1;

                for (let i = 1; i < uniqueDates.length; i++) {
                    const curr = new Date(uniqueDates[i - 1]);
                    const prev = new Date(uniqueDates[i]);
                    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        currentStreak++;
                        tempStreak++;
                        longestStreak = Math.max(longestStreak, tempStreak);
                    } else {
                        break;
                    }
                }
            }

            // Still calculate longest overall streak regardless of current continuity
            let maxStreakTracker = 1;
            let currentSequence = 1;
            for (let i = 1; i < uniqueDates.length; i++) {
                const curr = new Date(uniqueDates[i - 1]);
                const prev = new Date(uniqueDates[i]);
                const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentSequence++;
                    maxStreakTracker = Math.max(maxStreakTracker, currentSequence);
                } else {
                    currentSequence = 1;
                }
            }
            longestStreak = Math.max(longestStreak, maxStreakTracker);
        }

        // Aggregate projects
        let projectsLogged = 0;
        try {
            projectsLogged = await Project.countDocuments({ userId });
        } catch (e) {
            console.error('Error fetching project count:', e);
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

            // Create a local ISO string (YYYY-MM-DD) avoiding timezone shifts
            const formattedDate = `${dateForDay.getFullYear()}-${String(dateForDay.getMonth() + 1).padStart(2, '0')}-${String(dateForDay.getDate()).padStart(2, '0')}`;

            return {
                day: dayName,
                date: formattedDate, // Added exact date parameter 
                hours: Math.round(dayHours * 10) / 10
            };
        });

        res.json({
            totalSessions: entries.length,
            totalHours: Math.round(totalHours * 10) / 10,
            longestStreak,
            totalProblems,
            streak: currentStreak,
            projectsLogged,
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

// GET /progress/day — Get aggregated stats for a specific day
router.get('/day', async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required' });
        }

        // Parse requested date
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch all progress entries matching user up to that day for cumulative stats
        const allEntriesUpToDate = await Progress.find({
            userId,
            date: { $lte: endOfDay }
        }).sort({ date: -1 });

        // Day entries
        const dayEntries = allEntriesUpToDate.filter(e => {
            const d = new Date(e.date);
            return d >= startOfDay;
        });

        // Compute day aggregates
        const hoursCoded = dayEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
        const problemsSolved = dayEntries.reduce((sum, e) => sum + (e.problemsSolved || 0), 0);

        // Cumulative problems up to this date
        const cumulativeProblemsSolved = allEntriesUpToDate.reduce((sum, e) => sum + (e.problemsSolved || 0), 0);

        // Calculate coding streak up to this exact date
        let currentStreak = 0;
        if (allEntriesUpToDate.length > 0) {
            const uniqueDates = [
                ...new Set(
                    allEntriesUpToDate.map((e) => {
                        const d = new Date(e.date);
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })
                ),
            ];

            const targetStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

            const yesterdayDate = new Date(targetDate);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

            if (uniqueDates[0] === targetStr || uniqueDates[0] === yesterdayStr) {
                currentStreak = 1;
                for (let i = 1; i < uniqueDates.length; i++) {
                    const curr = new Date(uniqueDates[i - 1]);
                    const prev = new Date(uniqueDates[i]);
                    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // Total hours for that week up to the selected date
        const day = targetDate.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(targetDate);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const weekEntriesUpToDate = allEntriesUpToDate.filter(e => {
            const d = new Date(e.date);
            return d >= startOfWeek && d <= endOfDay;
        });

        const weekHoursCoded = weekEntriesUpToDate.reduce((sum, e) => sum + (e.hours || 0), 0);

        // Extract unique technologies dynamically
        const technologiesSet = new Set();
        dayEntries.forEach(e => {
            if (e.techLearned) {
                // Handle both new array format and legacy comma-separated string
                const techs = Array.isArray(e.techLearned)
                    ? e.techLearned
                    : e.techLearned.split(',').map(t => t.trim()).filter(Boolean);

                techs.forEach(tech => {
                    const trimmed = tech.trim();
                    if (trimmed) technologiesSet.add(trimmed);
                });
            }
        });

        res.json({
            date: date, // Keep original requested structure
            hoursCoded: Math.round(hoursCoded * 10) / 10,
            problemsSolved,
            technologies: Array.from(technologiesSet),
            streakUpToDate: currentStreak,
            cumulativeProblemsSolved,
            totalWeekHours: Math.round(weekHoursCoded * 10) / 10
        });

    } catch (error) {
        console.error('Error fetching daily progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /progress/:id — Update a progress entry
router.patch('/:id', async (req, res) => {
    try {
        const { hours, problemsSolved, techLearned, devLog } = req.body;

        const progress = await Progress.findOne({ _id: req.params.id, userId: req.user.id });
        if (!progress) {
            return res.status(404).json({ message: 'Progress entry not found' });
        }

        if (hours !== undefined) progress.hours = hours;
        if (problemsSolved !== undefined) progress.problemsSolved = problemsSolved;
        if (techLearned !== undefined) progress.techLearned = techLearned;
        if (devLog !== undefined) progress.devLog = devLog;

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

// GET /progress/month — Get aggregated stats for a specific month (e.g. ?month=2026-03)
router.get('/month', async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query; // YYYY-MM format

        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({ message: 'Valid month query parameter is required (YYYY-MM)' });
        }

        const [year, monthNum] = month.split('-').map(Number);

        // Start of month
        const startOfMonth = new Date(year, monthNum - 1, 1);
        startOfMonth.setHours(0, 0, 0, 0);

        // End of month
        const endOfMonth = new Date(year, monthNum, 0); // Last day of that month
        endOfMonth.setHours(23, 59, 59, 999);

        // Fetch all progress entries matching user and exact timeframe
        const monthEntries = await Progress.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // Group entries by day
        const daysInMonth = endOfMonth.getDate();
        const heatmapData = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const targetDateStart = new Date(year, monthNum - 1, i);
            targetDateStart.setHours(0, 0, 0, 0);

            const targetDateEnd = new Date(year, monthNum - 1, i);
            targetDateEnd.setHours(23, 59, 59, 999);

            const dayLogs = monthEntries.filter(e => {
                const eDate = new Date(e.date);
                return eDate >= targetDateStart && eDate <= targetDateEnd;
            });

            const dayHours = dayLogs.reduce((sum, e) => sum + (e.hours || 0), 0);
            const dayProblems = dayLogs.reduce((sum, e) => sum + (e.problemsSolved || 0), 0);

            const techSet = new Set();
            dayLogs.forEach(e => {
                if (e.techLearned) {
                    const techs = Array.isArray(e.techLearned)
                        ? e.techLearned
                        : (typeof e.techLearned === 'string'
                            ? e.techLearned.split(',').map(t => t.trim())
                            : []);

                    techs.forEach(tech => {
                        if (tech && typeof tech === 'string') techSet.add(tech);
                    });
                }
            });

            heatmapData.push({
                date: dateStr,
                hoursCoded: Math.round(dayHours * 10) / 10,
                problemsSolved: dayProblems,
                technologies: Array.from(techSet)
            });
        }

        res.json({
            month: month,
            days: heatmapData
        });

    } catch (error) {
        console.error('Error fetching monthly progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
