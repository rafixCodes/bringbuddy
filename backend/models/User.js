const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['sender', 'traveler', 'admin'], required: true },
  profilePhoto: { type: String, default: '' },

  travelerInfo: {
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['not_submitted', 'pending', 'approved', 'rejected'], default: 'not_submitted' },
    idDocumentUrl: { type: String, default: '' },
    emergencyContact: { name: String, phone: String },
    trustScore: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 },
    memberSince: { type: Date, default: Date.now },
    defaultCarryingFeePerKg: { type: Number, default: 0 },
    maxActiveOrders: { type: Number, default: 1 }
  },

  isSuspended: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);