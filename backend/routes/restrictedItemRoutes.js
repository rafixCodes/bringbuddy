const express = require("express");
const router = express.Router();

const {
  getRestrictedItems,
  createRestrictedItem,
  deleteRestrictedItem,
} = require("../controllers/restrictedItemController");

const { protect } = require("../middleware/authMiddleware");

// Get all restricted items
router.get("/", protect, getRestrictedItems);

// Create a restricted item
router.post("/", protect, createRestrictedItem);

// Delete a restricted item
router.delete("/:id", protect, deleteRestrictedItem);

module.exports = router;