const mongoose = require('mongoose');
const { Schema } = mongoose;

// This model represents a group of users (e.g., a household, a team of friends).
// Chores can be posted within a specific community.
const communitySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['household', 'neighborhood', 'friends', 'other'],
        default: 'friends'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Community', communitySchema);
