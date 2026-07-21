const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  createTestNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// Get all notifications
router.get("/", protect, getNotifications);

// Mark notification as read
router.put("/:id/read", protect, markAsRead);



module.exports = router;
