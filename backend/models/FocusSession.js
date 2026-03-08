const mongoose = require('mongoose');

const FocusSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sessionName: {
        type: String,
        default: 'Focus Session',
    },
    duration: {
        type: Number,
        required: true,
        default: 25, // Default 25 minutes
    },
    completed: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('FocusSession', FocusSessionSchema);
