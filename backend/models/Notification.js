const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      default: 'general',
    },
    title: {
      type: String,
      required: true,
      default: 'BringBuddy update',
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    actionUrl: {
      type: String,
      trim: true,
      default: '/notifications',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({
  user: 1,
  isRead: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  'Notification',
  notificationSchema
);