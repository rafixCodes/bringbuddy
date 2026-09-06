const mongoose = require('mongoose');
const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');

const isSameId = (left, right) => left && right && left.toString() === right.toString();

function calculateTrustScore(user, averageRating) {
  const ratingPoints = (averageRating / 5) * 55;
  const deliveryPoints = Math.min(user.travelerInfo?.completedDeliveries || 0, 20);
  const verificationPoints = user.travelerInfo?.isVerified ? 15 : 0;
  const cancellationRate = Math.min(Math.max(user.travelerInfo?.cancellationRate || 0, 0), 100);
  const reliabilityPoints = ((100 - cancellationRate) / 100) * 10;
  return Math.round(Math.min(ratingPoints + deliveryPoints + verificationPoints + reliabilityPoints, 100));
}

async function refreshReputation(userId) {
  const [summary, user] = await Promise.all([
    Review.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]),
    User.findById(userId)
  ]);

  if (!user) return null;
  const averageRating = summary[0]?.averageRating || 0;
  const totalReviews = summary[0]?.totalReviews || 0;
  user.travelerInfo.averageRating = Number(averageRating.toFixed(1));
  user.travelerInfo.totalReviews = totalReviews;
  user.travelerInfo.trustScore = calculateTrustScore(user, averageRating);
  await user.save();

  return {
    averageRating: user.travelerInfo.averageRating,
    totalReviews,
    trustScore: user.travelerInfo.trustScore
  };
}

function getParticipants(order, userId) {
  if (isSameId(order.sender?._id || order.sender, userId)) {
    return { reviewerRole: 'sender', reviewee: order.traveler };
  }
  if (isSameId(order.traveler?._id || order.traveler, userId)) {
    return { reviewerRole: 'traveler', reviewee: order.sender };
  }
  return null;
}

const getReviewContext = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('sender', 'name profilePhoto travelerInfo.averageRating travelerInfo.totalReviews travelerInfo.trustScore')
      .populate('traveler', 'name profilePhoto travelerInfo.averageRating travelerInfo.totalReviews travelerInfo.trustScore');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const participants = getParticipants(order, req.user.id);
    if (!participants) {
      return res.status(403).json({ success: false, message: 'Only this order\'s sender or traveler can access its reviews' });
    }
    if (!participants.reviewee) {
      return res.status(400).json({ success: false, message: 'This order does not have an assigned traveler' });
    }

    const [myReview, reviewAboutMe] = await Promise.all([
      Review.findOne({ order: order._id, reviewer: req.user.id }).populate('reviewee', 'name'),
      Review.findOne({ order: order._id, reviewee: req.user.id }).populate('reviewer', 'name')
    ]);

    return res.json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        orderType: order.orderType,
        pickup: order.pickup,
        destination: order.destination
      },
      reviewerRole: participants.reviewerRole,
      reviewee: participants.reviewee,
      canReview: order.status === 'completed' && !myReview,
      myReview,
      reviewAboutMe
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment = '' } = req.body;
    const numericRating = Number(rating);

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: 'A valid order is required' });
    }
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a whole number from 1 to 5' });
    }
    if (typeof comment !== 'string' || comment.trim().length > 500) {
      return res.status(400).json({ success: false, message: 'Comment must be 500 characters or fewer' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'completed') {
      return res.status(409).json({ success: false, message: 'Reviews can only be submitted after the order is completed' });
    }

    const participants = getParticipants(order, req.user.id);
    if (!participants || !participants.reviewee) {
      return res.status(403).json({ success: false, message: 'Only this order\'s sender and assigned traveler can review each other' });
    }

    const revieweeId = participants.reviewee._id || participants.reviewee;
    const review = await Review.create({
      order: order._id,
      reviewer: req.user.id,
      reviewee: revieweeId,
      reviewerRole: participants.reviewerRole,
      rating: numericRating,
      comment: comment.trim()
    });
    const reputation = await refreshReputation(revieweeId);
    await review.populate('reviewee', 'name');

    return res.status(201).json({ success: true, message: 'Review submitted successfully', review, reputation });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this order' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getUserReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const [user, reviews] = await Promise.all([
      User.findById(req.params.userId).select('name profilePhoto travelerInfo.averageRating travelerInfo.totalReviews travelerInfo.trustScore'),
      Review.find({ reviewee: req.params.userId })
        .populate('reviewer', 'name profilePhoto')
        .sort({ createdAt: -1 })
    ]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user, reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = { createReview, getReviewContext, getUserReviews };
