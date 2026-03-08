const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me
// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -resetPasswordOtp -resetPasswordExpires');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/users/update-profile
// Update user profile (name, phone, profileImage)
router.put('/update-profile', auth, async (req, res) => {
    try {
        const { name, phone, profileImage } = req.body;

        // Find user by ID
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate name minimum length if it's being updated
        if (name !== undefined) {
            if (name.trim().length < 2) {
                return res.status(400).json({ message: 'Name must be at least 2 characters' });
            }
            user.name = name.trim();
        }

        // Update other fields
        if (phone !== undefined) user.phone = phone.trim();
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        // Return updated user data (matching the structure expected by the frontend AuthContext)
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
