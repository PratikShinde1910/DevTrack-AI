const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    hours: {
        type: Number,
        required: [true, 'Hours coded is required'],
        min: [0, 'Hours cannot be negative'],
        max: [24, 'Hours cannot exceed 24'],
    },
    problemsSolved: {
        type: Number,
        default: 0,
        min: [0, 'Problems solved cannot be negative'],
    },
    techLearned: {
        type: [String],
        default: [],
    },
    devLog: {
        type: String,
        trim: true,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
progressSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
