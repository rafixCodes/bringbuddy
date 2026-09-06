const bcrypt = require('bcryptjs');
const User = require('../models/User');

const OTP_LIFETIME_MS = 10 * 60 * 1000;

const isAdmin = (user) => user.accountType === 'admin';

// POST /api/verifications/phone/request-otp
const requestPhoneOtp = async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot submit traveler verification',
      });
    }

    const user = await User.findById(req.user._id)
      .select('+phoneOtpHash +phoneOtpExpiresAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already verified',
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.phoneOtpHash = await bcrypt.hash(otp, 10);
    user.phoneOtpExpiresAt = new Date(Date.now() + OTP_LIFETIME_MS);
    await user.save();

    const response = {
      success: true,
      message: 'Verification OTP generated. It expires in 10 minutes.',
    };

    // BringBuddy uses a dummy OTP in development because no SMS provider is required.
    // Never expose the OTP when the application runs in production mode.
    if (process.env.NODE_ENV !== 'production') {
      response.demoOtp = otp;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Request phone OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// POST /api/verifications/phone/verify-otp
const verifyPhoneOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: 'A valid 6-digit OTP is required',
      });
    }

    const user = await User.findById(req.user._id)
      .select('+phoneOtpHash +phoneOtpExpiresAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.phoneVerified) {
      return res.status(200).json({
        success: true,
        message: 'Phone number is already verified',
      });
    }

    if (!user.phoneOtpHash || !user.phoneOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Request an OTP before trying to verify it',
      });
    }

    if (user.phoneOtpExpiresAt.getTime() < Date.now()) {
      user.phoneOtpHash = undefined;
      user.phoneOtpExpiresAt = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Request a new OTP.',
      });
    }

    const matches = await bcrypt.compare(String(otp), user.phoneOtpHash);

    if (!matches) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    user.phoneVerified = true;
    user.phoneOtpHash = undefined;
    user.phoneOtpExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      phoneVerified: true,
    });
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// POST /api/verifications/submit
const submitVerification = async (req, res) => {
  try {
    const {
      idDocumentType,
      idDocumentUrl,
      profilePhoto,
      emergencyContact,
    } = req.body;

    if (isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot submit traveler verification',
      });
    }

    if (!['passport', 'nid'].includes(idDocumentType)) {
      return res.status(400).json({
        success: false,
        message: 'Document type must be passport or nid',
      });
    }

    if (!idDocumentUrl || !String(idDocumentUrl).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Passport/NID document URL is required',
      });
    }

    if (!profilePhoto || !String(profilePhoto).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Profile photo URL is required',
      });
    }

    if (
      !emergencyContact ||
      !String(emergencyContact.name || '').trim() ||
      !String(emergencyContact.phone || '').trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Emergency contact name and phone are required',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Verify your phone number before submitting documents',
      });
    }

    if (user.travelerInfo.verificationStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Your verification is already pending admin review',
      });
    }

    if (user.travelerInfo.verificationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Your traveler account is already verified',
      });
    }

    user.profilePhoto = String(profilePhoto).trim();
    user.travelerInfo.idDocumentType = idDocumentType;
    user.travelerInfo.idDocumentUrl = String(idDocumentUrl).trim();
    user.travelerInfo.emergencyContact = {
      name: String(emergencyContact.name).trim(),
      phone: String(emergencyContact.phone).trim(),
    };
    user.travelerInfo.isVerified = false;
    user.travelerInfo.verificationStatus = 'pending';
    user.travelerInfo.verificationSubmittedAt = new Date();
    user.travelerInfo.verificationReviewedAt = undefined;
    user.travelerInfo.verificationReviewedBy = undefined;
    user.travelerInfo.rejectionReason = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Traveler verification submitted for admin review',
      verification: {
        status: user.travelerInfo.verificationStatus,
        submittedAt: user.travelerInfo.verificationSubmittedAt,
      },
    });
  } catch (error) {
    console.error('Submit verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// GET /api/verifications/me
const getMyVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email phone phoneVerified profilePhoto travelerInfo'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      verification: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        travelerInfo: user.travelerInfo,
      },
    });
  } catch (error) {
    console.error('Get verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// GET /api/verifications/pending (admin)
const getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({
      accountType: 'user',
      'travelerInfo.verificationStatus': 'pending',
    })
      .select('name email phone phoneVerified profilePhoto travelerInfo')
      .sort({ 'travelerInfo.verificationSubmittedAt': 1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      verifications: users,
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// PATCH /api/verifications/:userId/approve (admin)
const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.travelerInfo.verificationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending verification requests can be approved',
      });
    }

    user.travelerInfo.isVerified = true;
    user.travelerInfo.verificationStatus = 'approved';
    user.travelerInfo.verificationReviewedAt = new Date();
    user.travelerInfo.verificationReviewedBy = req.user._id;
    user.travelerInfo.rejectionReason = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Traveler verification approved',
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// PATCH /api/verifications/:userId/reject (admin)
const rejectVerification = async (req, res) => {
  try {
    const reason = String(req.body.reason || '').trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required',
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.travelerInfo.verificationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending verification requests can be rejected',
      });
    }

    user.travelerInfo.isVerified = false;
    user.travelerInfo.verificationStatus = 'rejected';
    user.travelerInfo.verificationReviewedAt = new Date();
    user.travelerInfo.verificationReviewedBy = req.user._id;
    user.travelerInfo.rejectionReason = reason;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Traveler verification rejected',
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  requestPhoneOtp,
  verifyPhoneOtp,
  submitVerification,
  getMyVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
};
