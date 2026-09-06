const User = require('../models/User');
const Trip = require('../models/Trip');
const Order = require('../models/Order');

// @desc  Platform-wide counts for the admin overview page
// @route GET /api/admin/overview
const getOverview = async (req, res) => {
  try {
    const [totalUsers, pendingVerification, activeOrders, totalTrips, suspendedUsers] = await Promise.all([
      User.countDocuments({ accountType: 'user' }),
      User.countDocuments({ 'travelerInfo.verificationStatus': 'pending' }),
      Order.countDocuments({
        status: { $in: ['accepted', 'payment_held', 'pickup_scheduled', 'collected', 'in_transit', 'arrived'] }
      }),
      Trip.countDocuments({}),
      User.countDocuments({ isSuspended: true }),
    ]);

    const recentSignups = await User.find({ accountType: 'user' })
      .select('name email currentMode travelerInfo.verificationStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingVerification,
        activeOrders,
        totalTrips,
        suspendedUsers,
      },
      recentSignups,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  List all non-admin users, optionally filtered by a search term
// @route GET /api/admin/users?search=
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { accountType: 'user' };

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('name email phone currentMode isSuspended isActive travelerInfo createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get a single user's full admin-facing detail
// @route GET /api/admin/users/:id
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.accountType === 'admin') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Suspend a user's account
// @route PATCH /api/admin/users/:id/suspend
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.accountType === 'admin') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isSuspended = true;
    await user.save();
    res.json({ success: true, message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Reactivate a suspended user's account
// @route PATCH /api/admin/users/:id/reactivate
const reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.accountType === 'admin') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isSuspended = false;
    await user.save();
    res.json({ success: true, message: 'User reactivated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  List all trips platform-wide, with traveler name populated
// @route GET /api/admin/trips
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({})
      .populate('traveler', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Admin takes a trip offline (published -> cancelled)
// @route PATCH /api/admin/trips/:id/disable
const disableTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    trip.status = 'cancelled';
    await trip.save();
    res.json({ success: true, message: 'Trip disabled', trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Admin re-enables a previously disabled trip
// @route PATCH /api/admin/trips/:id/enable
const enableTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    trip.status = 'published';
    await trip.save();
    res.json({ success: true, message: 'Trip re-enabled', trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  List all orders platform-wide (read-only monitoring), sender/traveler populated
// @route GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('sender', 'name email')
      .populate('traveler', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOverview,
  getUsers,
  getUserDetail,
  suspendUser,
  reactivateUser,
  getTrips,
  disableTrip,
  enableTrip,
  getOrders,
};