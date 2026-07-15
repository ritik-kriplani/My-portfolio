const express = require('express');
const router = express.Router();
const Guestbook = require('../models/Guestbook');
const auth = require('../middleware/auth');

// @route   GET api/guestbook
// @desc    Get all approved guestbook signatures
// @access  Public
router.get('/', async (req, res) => {
  try {
    const entries = await Guestbook.find({ approved: true }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/guestbook
// @desc    Submit a new guestbook signature (requires approval)
// @access  Public
router.post('/', async (req, res) => {
  const { name, comment, avatarSeed } = req.body;

  if (!name || !comment) {
    return res.status(400).json({ msg: 'Please enter name and comment' });
  }

  try {
    const newEntry = new Guestbook({
      name,
      comment,
      avatarSeed: avatarSeed || Math.floor(Math.random() * 10 + 1).toString(),
      approved: false // defaults to false for moderation
    });

    const entry = await newEntry.save();
    res.json({ msg: 'Comment submitted! It will appear once approved by the admin.', entry });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/guestbook/all
// @desc    Get all guestbook signatures (for admin moderation)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const entries = await Guestbook.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/guestbook/:id/approve
// @desc    Toggle approval status of a signature
// @access  Private
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const entry = await Guestbook.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });

    entry.approved = !entry.approved;
    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/guestbook/:id
// @desc    Delete a guestbook signature
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Guestbook.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });

    await Guestbook.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
