const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getOrderTracking,
  updateOrderStatus,
} = require('../controllers/trackingController');

const router = express.Router();

router.get('/:orderId', protect, getOrderTracking);
router.patch('/:orderId/status', protect, updateOrderStatus);

module.exports = router;
