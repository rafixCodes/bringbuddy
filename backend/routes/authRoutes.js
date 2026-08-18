const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  completeOnboarding
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes
router.get('/profile', protect, getUserProfile);
router.post('/onboarding', protect, completeOnboarding);

module.exports = router;