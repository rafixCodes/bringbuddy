const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getRestrictedItems,
  checkRestrictedItems,
  addRestrictedItem,
  deleteRestrictedItem,
} = require('../controllers/restrictedItemController');

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user.accountType !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return next();
};

router.get('/', protect, getRestrictedItems);
router.post('/check', protect, checkRestrictedItems);
router.post('/', protect, requireAdmin, addRestrictedItem);
router.delete('/:id', protect, requireAdmin, deleteRestrictedItem);

module.exports = router;
