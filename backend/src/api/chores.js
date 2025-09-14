const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

const Chore = mongoose.model('Chore');
const router = express.Router();

// Use auth middleware for all chore routes
router.use(auth);

// @route   POST /api/chores
// @desc    Create a new chore
// @access  Private
router.post('/', async (req, res) => {
    const { title, description, level, communityId } = req.body;

    if (!title || !level) {
        return res.status(400).send({ error: 'Title and level are required.' });
    }

    try {
        const chore = new Chore({
            title,
            description,
            level,
            createdBy: req.user._id,
            community: communityId // Optional: can be null
        });

        await chore.save();
        res.status(201).send(chore);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// @route   GET /api/chores
// @desc    Get all chores (marketplace feed)
// @access  Private
router.get('/', async (req, res) => {
    try {
        // Find chores that are not created by the current user and are still posted
        const chores = await Chore.find({ createdBy: { $ne: req.user._id }, status: 'posted' })
                                  .populate('createdBy', 'displayName profilePictureUrl') // Populate user details
                                  .sort({ createdAt: -1 }); // Sort by newest
        res.send(chores);
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
    }
});

// @route   GET /api/chores/:id
// @desc    Get a single chore by ID
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const chore = await Chore.findById(req.params.id)
                                 .populate('createdBy', 'displayName profilePictureUrl');

        if (!chore) {
            return res.status(404).send({ error: 'Chore not found.' });
        }

        res.send(chore);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).send({ error: 'Chore not found.' });
        }
        res.status(500).send({ error: 'Server error' });
    }
});

// @route   POST /api/chores/:id/claim
// @desc    Claim a chore from the marketplace
// @access  Private
router.post('/:id/claim', async (req, res) => {
    try {
        const chore = await Chore.findById(req.params.id);

        if (!chore) {
            return res.status(404).send({ error: 'Chore not found.' });
        }

        if (chore.status !== 'posted') {
            return res.status(400).send({ error: 'Chore is not available to be claimed.' });
        }

        if (chore.createdBy.equals(req.user._id)) {
            return res.status(400).send({ error: 'You cannot claim your own chore.' });
        }

        chore.status = 'in_progress';
        chore.completedBy = req.user._id;

        await chore.save();
        res.send(chore);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).send({ error: 'Chore not found.' });
        }
        res.status(500).send({ error: 'Server error' });
    }
});

// @route   POST /api/chores/:id/complete
// @desc    Mark a claimed chore as complete
// @access  Private
router.post('/:id/complete', async (req, res) => {
    const { proofOfCompletionUrl } = req.body;

    if (!proofOfCompletionUrl) {
        return res.status(400).send({ error: 'Proof of completion is required.' });
    }

    try {
        const chore = await Chore.findById(req.params.id);

        if (!chore) {
            return res.status(404).send({ error: 'Chore not found.' });
        }

        if (chore.status !== 'in_progress') {
            return res.status(400).send({ error: 'Chore is not in progress.' });
        }

        if (!chore.completedBy.equals(req.user._id)) {
            return res.status(403).send({ error: 'You are not authorized to complete this chore.' });
        }

        chore.status = 'completed';
        chore.proofOfCompletionUrl = proofOfCompletionUrl;

        await chore.save();
        res.send(chore);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).send({ error: 'Chore not found.' });
        }
        res.status(500).send({ error: 'Server error' });
    }
});

const User = mongoose.model('User');
const Swap = mongoose.model('Swap');

// @route   POST /api/chores/:id/verify
// @desc    Verify a completed chore, transfer credits, and award XP
// @access  Private
router.post('/:id/verify', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const chore = await Chore.findById(req.params.id).session(session);

        if (!chore) {
            await session.abortTransaction();
            return res.status(404).send({ error: 'Chore not found.' });
        }

        if (chore.status !== 'completed') {
            await session.abortTransaction();
            return res.status(400).send({ error: 'Chore has not been completed yet.' });
        }

        if (!chore.createdBy.equals(req.user._id)) {
            await session.abortTransaction();
            return res.status(403).send({ error: 'You are not authorized to verify this chore.' });
        }

        const fromUser = await User.findById(chore.createdBy).session(session);
        const toUser = await User.findById(chore.completedBy).session(session);

        if (fromUser.credits < chore.credits) {
            await session.abortTransaction();
            return res.status(400).send({ error: 'Insufficient credits to complete the swap.' });
        }

        // Perform the credit transfer and XP awards
        fromUser.credits -= chore.credits;
        toUser.credits += chore.credits;

        // Award XP (e.g., 10 XP for creating, 20 for completing)
        fromUser.xp += 10;
        toUser.xp += 20;

        await fromUser.save({ session });
        await toUser.save({ session });

        // Update the chore status
        chore.status = 'verified';
        await chore.save({ session });

        // Create a swap record
        const swap = new Swap({
            chore: chore._id,
            fromUser: fromUser._id,
            toUser: toUser._id,
            credits: chore.credits,
            status: 'completed'
        });
        await swap.save({ session });

        await session.commitTransaction();
        res.send({ message: 'Chore verified and swap completed successfully!', swap });

    } catch (err) {
        await session.abortTransaction();
        if (err.kind === 'ObjectId') {
            return res.status(404).send({ error: 'Chore not found.' });
        }
        res.status(500).send({ error: 'Server error during verification.' });
    } finally {
        session.endSession();
    }
});

module.exports = router;
