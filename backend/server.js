const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const focusRoutes = require('./routes/focus');
const insightsRoutes = require('./routes/insights');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/progress', progressRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'DevTrack AI API is running' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });