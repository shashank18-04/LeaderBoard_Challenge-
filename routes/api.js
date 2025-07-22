const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ClaimHistory = require('../models/ClaimHistory');

// GET: Fetch all users with their ranks
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 });
    const rankedUsers = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1,
    }));
    res.json(rankedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Add a new user
router.post('/users', async (req, res) => {
  const user = new User({
    name: req.body.name,
    points: req.body.points || 0, // Allow setting initial points
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST: Claim random points for a user
router.post('/users/:id/claim', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const randomPoints = Math.floor(Math.random() * 10) + 1;
    user.points += randomPoints;

    const history = new ClaimHistory({
      userId: user._id,
      pointsClaimed: randomPoints,
    });

    await history.save();
    const updatedUser = await user.save();
    res.json({ updatedUser, pointsClaimed: randomPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Clear all scores and history
router.post('/users/clear-scores', async (req, res) => {
    try {
        await User.updateMany({}, { $set: { points: 0 } });
        await ClaimHistory.deleteMany({});
        res.status(200).json({ message: 'All scores and history have been cleared.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Remove a single user and their history
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        await ClaimHistory.deleteMany({ userId: req.params.id });
        res.status(200).json({ message: 'User and their history have been deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user.' });
    }
});

// --- NEW ---
// DELETE: Remove ALL users and ALL history
router.delete('/users', async (req, res) => {
    try {
        await User.deleteMany({});
        await ClaimHistory.deleteMany({});
        res.status(200).json({ message: 'All users and history have been deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete all users.' });
    }
});


module.exports = router;
