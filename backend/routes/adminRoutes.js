const express = require('express');
const router = express.Router();

const {
  getOverview,
  getUsers,
  getUserDetail,
  suspendUser,
  reactivateUser,
  getTrips,
  disableTrip,
  enableTrip,
  getOrders,
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');

// Every admin route requires a logged-in user with accountType 'admin'.
// Mirrors the adminOnly pattern already used in verificationRoutes.js.
const adminOnly = (req, res, next) => {
  if (req.user.accountType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

router.use(protect, adminOnly);

router.get('/overview', getOverview);

router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/reactivate', reactivateUser);

router.get('/trips', getTrips);
router.patch('/trips/:id/disable', disableTrip);
router.patch('/trips/:id/enable', enableTrip);

router.get('/orders', getOrders);

module.exports = router;