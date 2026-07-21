const mongoose = require('mongoose');
const User = require('../models/User');

// ===============================
// Get User Profile
// ===============================
const getUserProfile = async (req, res) => {
  try {
    // Check if the provided user ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid user ID'
      });
    }

    // Find user and exclude password
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ===============================
// Update User Profile
// ===============================
const updateUserProfile = async (req, res) => {
  try {
    // Check if the provided user ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid user ID'
      });
    }

    // Find user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Update allowed profile fields
    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    if (req.body.profilePhoto !== undefined) {
      user.profilePhoto = req.body.profilePhoto;
    }

    // Save updated user
    const updatedUser = await user.save();

    // Remove password before sending response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// Export functions
module.exports = {
  getUserProfile,
  updateUserProfile
};