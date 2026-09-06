const express = require('express');

const {
  getMyCancellationOrders,
  cancelOrder,
  recoverOrder,
} = require('../controllers/cancellationController');

const {
  protect,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyCancellationOrders);
router.post('/:orderId', cancelOrder);
router.post('/:orderId/recover', recoverOrder);

module.exports = router;
