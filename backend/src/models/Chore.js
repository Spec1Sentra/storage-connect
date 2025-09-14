const mongoose = require('mongoose');
const { Schema } = mongoose;

const choreSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    level: {
        type: Number,
        required: true,
        enum: [1, 2, 3] // Enforce the chore level
    },
    credits: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['posted', 'in_progress', 'completed', 'verified'],
        default: 'posted'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    community: {
        type: Schema.Types.ObjectId,
        ref: 'Community'
    },
    proofOfCompletionUrl: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to set credits based on level
choreSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('level')) {
        // Simple credit calculation: Level 1 = 10, Level 2 = 20, Level 3 = 30
        this.credits = this.level * 10;
    }
    next();
});

mongoose.model('Chore', choreSchema);
