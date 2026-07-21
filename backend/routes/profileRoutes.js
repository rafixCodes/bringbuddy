const express = require('express');
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile
} = require('../controllers/profileController');

// Get user profile
router.get('/:id', getUserProfile);

// Update user profile
router.put('/:id', updateUserProfile);

module.exports = router;