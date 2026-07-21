const User = require("../models/User");

// Traveler submits verification
const submitVerification = async (req, res) => {
  try {
    const { idDocumentUrl, emergencyContact } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "traveler") {
      return res
        .status(403)
        .json({ message: "Only travelers can request verification." });
    }

    user.travelerInfo.idDocumentUrl = idDocumentUrl;
    user.travelerInfo.emergencyContact = emergencyContact;
    user.travelerInfo.verificationStatus = "pending";

    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification submitted successfully.",
      travelerInfo: user.travelerInfo,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin gets all pending requests
const getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({
      role: "traveler",
      "travelerInfo.verificationStatus": "pending",
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approves traveler
const approveTraveler = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "Traveler not found" });

    user.travelerInfo.isVerified = true;
    user.travelerInfo.verificationStatus = "approved";

    await user.save();

    res.json({
      success: true,
      message: "Traveler approved successfully.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin rejects traveler
const rejectTraveler = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "Traveler not found" });

    user.travelerInfo.isVerified = false;
    user.travelerInfo.verificationStatus = "rejected";

    await user.save();

    res.json({
      success: true,
      message: "Traveler rejected.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  submitVerification,
  getPendingVerifications,
  approveTraveler,
  rejectTraveler,
};