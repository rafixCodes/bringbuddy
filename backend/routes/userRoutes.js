const express = require("express");
const router = express.Router();

const {
  submitVerification,
  getPendingVerifications,
  approveTraveler,
  rejectTraveler,
} = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Traveler
router.post(
  "/verification/submit",
  protect,
  authorize("traveler"),
  submitVerification
);

// Admin
router.get(
  "/verification/pending",
  protect,
  authorize("admin"),
  getPendingVerifications
);

router.put(
  "/verification/:id/approve",
  protect,
  authorize("admin"),
  approveTraveler
);

router.put(
  "/verification/:id/reject",
  protect,
  authorize("admin"),
  rejectTraveler
);

module.exports = router;