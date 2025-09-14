const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/./../../../.env' });


const router = express.Router();

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

// callback route for google to redirect to
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login/failed' }), (req, res) => {
    // successful authentication, generate jwt
    const payload = {
        id: req.user.id,
        displayName: req.user.displayName
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    // This is where you would typically redirect to the frontend with the token
    // For a mobile app, you might use a deep link
    // For this example, we'll send the token in a query parameter
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
});

// route for failed login
router.get('/login/failed', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'user failed to authenticate.'
    });
});

const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/google/token
// @desc    Authenticate user with Google ID token from mobile app
// @access  Public
router.post('/google/token', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'ID token is required.' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({
                googleId,
                displayName: name,
                email,
                profilePictureUrl: picture,
            });
            await user.save();
        }

        const payload = {
            id: user.id,
            displayName: user.displayName,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

        res.status(200).json({ token, user });

    } catch (error) {
        console.error('Google token verification failed:', error);
        res.status(401).json({ message: 'Invalid Google token.' });
    }
});


module.exports = router;
