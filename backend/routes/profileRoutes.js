const express = require('express');
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile
} = require('../controllers/profileController');

const { protect } = require('../middleware/authMiddleware');

// Get logged-in user's profile
router.get('/', protect, getUserProfile);

// Update logged-in user's profile
router.put('/', protect, updateUserProfile);

module.exports = router;