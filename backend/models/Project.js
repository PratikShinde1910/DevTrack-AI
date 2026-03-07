const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    techStack: {
        type: [String],
        default: [],
    },
    progress: {
        type: Number,
        default: 0,
        min: [0, 'Progress cannot be negative'],
        max: [100, 'Progress cannot exceed 100'],
    },
    github: {
        type: String,
        trim: true,
        default: '',
    },
    notes: {
        type: [String],
        default: [],
    },
    totalHours: {
        type: Number,
        default: 0,
        min: 0,
    },
    iconUrl: {
        type: String,
        trim: true,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

projectSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
