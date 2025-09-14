const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

const User = mongoose.model('User');
const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // The user object is already attached to the request by the auth middleware
        const user = await User.findById(req.user.id).select('-googleId'); // Exclude sensitive info
        res.send(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private (for now, to ensure only logged-in users can see profiles)
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
                               .select('displayName profilePictureUrl level xp chorePersona createdAt'); // Select only public info

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
