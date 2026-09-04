const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createReview, getReviewContext, getUserReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/orders/:orderId', protect, getReviewContext);
router.get('/users/:userId', protect, getUserReviews);

module.exports = router;
