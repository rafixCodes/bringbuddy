const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerRole: { type: String, enum: ['sender', 'traveler'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

// A sender and traveler may each leave one review for the same completed order.
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
