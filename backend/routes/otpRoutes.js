const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getOtpStatus,
  generateDeliveryOtp,
  verifyDeliveryOtp,
} = require('../controllers/otpController');

const router = express.Router();

router.post('/verify', verifyDeliveryOtp);
router.get('/:orderId', protect, getOtpStatus);
router.post('/:orderId/generate', protect, generateDeliveryOtp);

module.exports = router;
