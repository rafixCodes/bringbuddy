const Review = require("../models/Review");
const Order = require("../models/Order");

// Create Review
const createReview = async (req, res) => {
  try {
    const { order, reviewer, reviewee, rating, comment } = req.body;

    // Required fields
    if (!order || !reviewer || !reviewee || !rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Check if order exists
    const existingOrder = await Order.findById(order);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Only completed orders can be reviewed
    if (existingOrder.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed orders can be reviewed.",
      });
    }

    // Check duplicate review
    const existingReview = await Review.findOne({
      order,
      reviewer,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this order.",
      });
    }

    // Create review
    const review = await Review.create({
      order,
      reviewer,
      reviewee,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Reviews for a Traveler
const getTravelerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewee: req.params.id,
    })
      .populate("reviewer", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Review
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Rating Summary
const getRatingSummary = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewee: req.params.id,
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1);

    res.status(200).json({
      success: true,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getTravelerReviews,
  updateReview,
  deleteReview,
  getRatingSummary,
};