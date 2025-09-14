const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profilePictureUrl: {
        type: String
    },
    chorePersona: {
        type: String
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    credits: {
        type: Number,
        default: 10 // Start users with a few credits to encourage swapping
    },
    streaks: {
        type: Number,
        default: 0
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    communities: [{
        type: Schema.Types.ObjectId,
        ref: 'Community'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate XP required for the next level
userSchema.methods.xpForNextLevel = function() {
    // Simple exponential curve: 100, 200, 400, 800...
    // Or a linear one: 100, 200, 300... For MVP, linear is fine.
    return this.level * 100;
};

// Pre-save hook to check for level-ups
userSchema.pre('save', function(next) {
    if (this.isModified('xp')) {
        // Use a while loop to handle multiple level-ups at once
        while (this.xp >= this.xpForNextLevel()) {
            this.level++;
        }
    }
    next();
});

mongoose.model('User', userSchema);
