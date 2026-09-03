const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  requestPhoneOtp,
  verifyPhoneOtp,
  submitVerification,
  getMyVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} = require('../controllers/verificationController');

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.accountType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

router.use(protect);

router.post('/phone/request-otp', requestPhoneOtp);
router.post('/phone/verify-otp', verifyPhoneOtp);
router.post('/submit', submitVerification);
router.get('/me', getMyVerification);

router.get('/pending', adminOnly, getPendingVerifications);
router.patch('/:userId/approve', adminOnly, approveVerification);
router.patch('/:userId/reject', adminOnly, rejectVerification);

module.exports = router;
