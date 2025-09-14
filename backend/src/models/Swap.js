const mongoose = require('mongoose');
const { Schema } = mongoose;

// This model represents the completed transaction/exchange of a chore.
// It serves as a historical record of a successful swap.
const swapSchema = new Schema({
    chore: {
        type: Schema.Types.ObjectId,
        ref: 'Chore',
        required: true
    },
    // The user who originally posted the chore
    fromUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The user who completed the chore
    toUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending_verification', 'completed'],
        default: 'pending_verification'
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Swap', swapSchema);
