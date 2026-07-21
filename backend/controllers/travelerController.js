const User = require('../models/User');

// @desc Get a traveler's public profile & reputation card
// @route GET /api/travelers/:id
const getTravelerProfile = async (req, res) => {
  try {
    const traveler = await User.findById(req.params.id).select('-password');

    if (!traveler || traveler.role !== 'traveler') {
      return res.status(404).json({ message: 'Traveler not found' });
    }

    res.json({
      _id: traveler._id,
      name: traveler.name,
      profilePhoto: traveler.profilePhoto,
      isVerified: traveler.travelerInfo.isVerified,
      verificationStatus: traveler.travelerInfo.verificationStatus,
      trustScore: traveler.travelerInfo.trustScore,
      completedDeliveries: traveler.travelerInfo.completedDeliveries,
      cancellationRate: traveler.travelerInfo.cancellationRate,
      averageRating: traveler.travelerInfo.averageRating,
      totalReviews: traveler.travelerInfo.totalReviews,
      responseTime: traveler.travelerInfo.responseTime,
      memberSince: traveler.travelerInfo.memberSince,
      defaultCarryingFeePerKg: traveler.travelerInfo.defaultCarryingFeePerKg
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTravelerProfile };