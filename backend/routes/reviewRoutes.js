const express = require("express");
const router = express.Router();

const {
  createReview,
  getTravelerReviews,
  updateReview,
  deleteReview,
  getRatingSummary,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Create Review
router.post("/", protect, createReview);

// View Reviews of a Traveler
router.get("/traveler/:id", getTravelerReviews);

// Rating Summary
router.get("/traveler/:id/summary", getRatingSummary);

// Update Review
router.put("/:id", protect, updateReview);

// Delete Review
router.delete("/:id", protect, deleteReview);

module.exports = router;
