const mongoose = require('mongoose');

const directBookingRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    traveler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    proposedFee: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

directBookingRequestSchema.index({ order: 1, status: 1 });
directBookingRequestSchema.index({ traveler: 1, status: 1 });

module.exports = mongoose.model(
  'DirectBookingRequest',
  directBookingRequestSchema
);
