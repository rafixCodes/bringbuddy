const express = require("express");

const router = express.Router();

const {
  getRestrictedItems,
  checkRestrictedItems,
  addRestrictedItem,
  updateRestrictedItem,
  deleteRestrictedItem,
} = require("../controllers/restrictedItemController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Public
router.get("/", getRestrictedItems);
router.post("/check", checkRestrictedItems);

// Admin Only
router.post(
  "/",
  protect,
  authorize("admin"),
  addRestrictedItem
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateRestrictedItem
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteRestrictedItem
);

module.exports = router;