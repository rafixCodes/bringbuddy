const mongoose = require('mongoose');
const Order = require('../models/Order');
const Trip = require('../models/Trip');

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function orderMatchesTrip(order, trip) {
  const pickupMatches =
    normalizeText(order.pickup?.city) === normalizeText(trip.departureCity) &&
    normalizeText(order.pickup?.country) ===
      normalizeText(trip.departureCountry);

  const destinationMatches =
    normalizeText(order.destination?.city) ===
      normalizeText(trip.destinationCity) &&
    normalizeText(order.destination?.country) ===
      normalizeText(trip.destinationCountry);

  const hasCapacity =
    order.orderType !== 'parcel' ||
    !order.totalWeightKg ||
    Number(trip.remainingCapacityKg) >= Number(order.totalWeightKg);

  return pickupMatches && destinationMatches && hasCapacity;
}

// GET /api/marketplace/orders
// A verified traveler views public orders that are still available.
const getMarketplaceOrders = async (req, res) => {
  try {
    if (req.user.currentMode !== 'traveler') {
      return res.status(403).json({
        success: false,
        message: 'Switch to traveler mode to view marketplace orders',
      });
    }

    if (!req.user.travelerInfo?.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          'Traveler verification is required to view and apply for marketplace orders',
      });
    }

    const { tripId } = req.query;

    let selectedTrip = null;

    if (tripId) {
      if (!mongoose.isValidObjectId(tripId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid trip ID',
        });
      }

      selectedTrip = await Trip.findById(tripId);

      if (!selectedTrip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found',
        });
      }

      if (
        selectedTrip.traveler.toString() !== req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only search using your own trip',
        });
      }

      if (selectedTrip.status !== 'published') {
        return res.status(400).json({
          success: false,
          message: 'Only published trips can be used for matching',
        });
      }
    }

    const orders = await Order.find({
      bookingMethod: 'public',
      isPublic: true,
      traveler: null,
      sender: { $ne: req.user.id },
      status: { $in: ['created', 'pending'] },
    })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(100);

    const matchingOrders = selectedTrip
      ? orders.filter((order) => orderMatchesTrip(order, selectedTrip))
      : orders;

    return res.status(200).json({
      success: true,
      count: matchingOrders.length,
      selectedTrip,
      orders: matchingOrders,
    });
  } catch (error) {
    console.error('Get marketplace orders error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getMarketplaceOrders,
};