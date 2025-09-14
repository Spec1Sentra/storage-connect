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

module.exports = router;
