const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/./../../.env' });


const User = require('../models/User');

passport.use(
    new GoogleStrategy({
            // options for google strategy
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback'
        },
        async(accessToken, refreshToken, profile, done) => {
            // check if user already exists in our db
            const existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                // already have a user
                return done(null, existingUser);
            } else {
                // if not, create user in our db
                const newUser = await new User({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    profilePictureUrl: profile.photos[0].value
                }).save();
                return done(null, newUser);
            }
        }
    )
);
