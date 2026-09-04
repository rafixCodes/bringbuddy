const express = require('express');
const {
  getMarketplaceOrders,
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/orders', protect, getMarketplaceOrders);

module.exports = router;