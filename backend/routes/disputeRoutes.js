const express = require('express');

const router = express.Router();

const {
  createDispute,
  getMyDisputes,
  getDisputeById,
  getAllDisputes,
  markUnderReview,
  resolveDispute
} = require('../controllers/disputeController');

const {
  protect
} = require('../middleware/authMiddleware');


// User raises dispute
router.post('/', protect, createDispute);


// User views own disputes
router.get('/my', protect, getMyDisputes);


// Admin views every dispute
router.get('/', protect, getAllDisputes);


// Admin marks dispute under review
router.patch('/:id/review', protect, markUnderReview);


// Admin resolves dispute
router.patch('/:id/resolve', protect, resolveDispute);


// User/admin views one dispute
// Keep this after the more specific routes above.
router.get('/:id', protect, getDisputeById);


module.exports = router;