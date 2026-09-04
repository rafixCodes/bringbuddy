const Application = require('../models/Application');
const DirectBookingRequest = require('../models/DirectBookingRequest');
const Order = require('../models/Order');
const Trip = require('../models/Trip');
const OrderHub = require('../models/OrderHub');
const User = require('../models/User');

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const doesTripMatchOrder = (trip, order) => {
  const sameDeparture =
    normalizeText(trip.departureCity) === normalizeText(order.pickup?.city) &&
    normalizeText(trip.departureCountry) === normalizeText(order.pickup?.country);

  const sameDestination =
    normalizeText(trip.destinationCity) === normalizeText(order.destination?.city) &&
    normalizeText(trip.destinationCountry) === normalizeText(order.destination?.country);

  return sameDeparture && sameDestination;
};

const hasEnoughCapacity = (trip, order) => {
  if (order.orderType !== 'parcel' || !order.totalWeightKg) {
    return true;
  }

  return Number(trip.remainingCapacityKg) >= Number(order.totalWeightKg);
};

const validateFee = (value) => {
  const fee = Number(value);
  return Number.isFinite(fee) && fee > 0 ? fee : null;
};

const validateSenderOrder = (order, userId, { requireOpen = true } = {}) => {
  if (!order) {
    return { status: 404, message: 'Order not found' };
  }

  if (order.sender.toString() !== userId.toString()) {
    return { status: 403, message: 'You are not allowed to manage this order' };
  }

  if (
    requireOpen &&
    (order.traveler || !['created', 'pending'].includes(order.status))
  ) {
    return {
      status: 400,
      message: 'This order already has a traveler or is no longer available',
    };
  }

  return null;
};

// GET /api/applications/direct/options/:orderId
// Sender finds verified traveler trips for an existing order.
// The marketplace listing stays active while the sender searches manually.
const getDirectBookingOptions = async (req, res) => {
  try {
    if (req.user.currentMode !== 'sender') {
      return res.status(403).json({
        success: false,
        message: 'Switch to sender mode to find a traveler',
      });
    }

    const order = await Order.findById(req.params.orderId);
    const orderError = validateSenderOrder(order, req.user.id);

    if (orderError) {
      return res.status(orderError.status).json({
        success: false,
        message: orderError.message,
      });
    }

    const [trips, pendingDirectRequests, pendingApplications] = await Promise.all([
      Trip.find({
        status: 'published',
        travelDate: { $gte: new Date() },
      })
        .populate(
          'traveler',
          'name profilePhoto travelerInfo.isVerified travelerInfo.averageRating travelerInfo.completedDeliveries travelerInfo.trustScore travelerInfo.defaultCarryingFeePerKg isActive isSuspended'
        )
        .sort({ travelDate: 1 }),

      DirectBookingRequest.find({
        order: order._id,
        status: 'pending',
      }).select('traveler'),

      Application.find({
        order: order._id,
        status: 'pending',
      }).select('traveler'),
    ]);

    const unavailableTravelerIds = new Set([
      ...pendingDirectRequests.map((request) => request.traveler.toString()),
      ...pendingApplications.map((application) => application.traveler.toString()),
    ]);

    const options = trips
      .filter((trip) => {
        const traveler = trip.traveler;

        if (!traveler) return false;
        if (traveler._id.toString() === req.user.id.toString()) return false;
        if (unavailableTravelerIds.has(traveler._id.toString())) return false;
        if (!traveler.isActive || traveler.isSuspended) return false;
        if (!traveler.travelerInfo?.isVerified) return false;
        if (!doesTripMatchOrder(trip, order)) return false;
        if (!hasEnoughCapacity(trip, order)) return false;

        return true;
      })
      .map((trip) => ({
        trip,
        suggestedFee:
          order.orderType === 'parcel' && order.totalWeightKg
            ? Number(trip.pricePerKg || 0) * Number(order.totalWeightKg)
            : Number(trip.pricePerKg || 0),
      }));

    return res.status(200).json({
      success: true,
      count: options.length,
      order: {
        _id: order._id,
        orderType: order.orderType,
        bookingMethod: order.bookingMethod,
        pickup: order.pickup,
        destination: order.destination,
        totalWeightKg: order.totalWeightKg,
        status: order.status,
        isPublic: order.isPublic,
      },
      options,
    });
  } catch (error) {
    console.error('Get traveler options error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// POST /api/applications/direct/:orderId
// Sender approaches a traveler for the same existing order.
const sendDirectBookingRequest = async (req, res) => {
  try {
    if (req.user.currentMode !== 'sender') {
      return res.status(403).json({
        success: false,
        message: 'Switch to sender mode to send a booking request',
      });
    }

    const { tripId, proposedFee, message } = req.body;
    const numericFee = validateFee(proposedFee);

    if (!tripId || numericFee === null) {
      return res.status(400).json({
        success: false,
        message: 'Trip and a valid proposed fee greater than 0 are required',
      });
    }

    const order = await Order.findById(req.params.orderId);
    const orderError = validateSenderOrder(order, req.user.id);

    if (orderError) {
      return res.status(orderError.status).json({
        success: false,
        message: orderError.message,
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Only published trips can receive booking requests',
      });
    }

    if (new Date(trip.travelDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This trip has already passed',
      });
    }

    if (!doesTripMatchOrder(trip, order)) {
      return res.status(400).json({
        success: false,
        message: 'This trip does not match the order route',
      });
    }

    if (!hasEnoughCapacity(trip, order)) {
      return res.status(400).json({
        success: false,
        message: 'This trip does not have enough remaining luggage capacity',
      });
    }

    if (trip.traveler.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a booking request to yourself',
      });
    }

    const traveler = await User.findById(trip.traveler);

    if (!traveler) {
      return res.status(404).json({
        success: false,
        message: 'Traveler account not found',
      });
    }

    if (!traveler.isActive || traveler.isSuspended) {
      return res.status(400).json({
        success: false,
        message: 'This traveler is not currently available',
      });
    }

    if (!traveler.travelerInfo?.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Only verified travelers can receive booking requests',
      });
    }

    const existingApplication = await Application.findOne({
      order: order._id,
      traveler: traveler._id,
      status: 'pending',
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message:
          'This traveler already applied to your order. Review their marketplace application instead.',
      });
    }

    const existingDirectRequest = await DirectBookingRequest.findOne({
      order: order._id,
      traveler: traveler._id,
      status: 'pending',
    });

    if (existingDirectRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request with this traveler',
      });
    }

    const directRequest = await DirectBookingRequest.create({
      order: order._id,
      sender: req.user.id,
      traveler: traveler._id,
      trip: trip._id,
      proposedFee: numericFee,
      message: message || '',
    });

    if (order.status === 'created') {
      order.status = 'pending';
    }

    order.timeline.push({
      status: 'pending',
      note: `Direct booking request sent to ${traveler.name}`,
    });

    // Important: do NOT close the marketplace here.
    // The order remains public until somebody is actually accepted.
    await order.save();

    const populatedRequest = await DirectBookingRequest.findById(
      directRequest._id
    )
      .populate(
        'traveler',
        'name profilePhoto travelerInfo.isVerified travelerInfo.averageRating travelerInfo.completedDeliveries travelerInfo.trustScore'
      )
      .populate(
        'trip',
        'departureCity departureCountry destinationCity destinationCountry travelDate remainingCapacityKg pricePerKg status'
      );

    return res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      request: populatedRequest,
      order,
    });
  } catch (error) {
    console.error('Send direct booking request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// GET /api/applications/direct/order/:orderId
// Sender sees direct requests they sent for one order.
const getOrderDirectBookingRequests = async (req, res) => {
  try {
    if (req.user.currentMode !== 'sender') {
      return res.status(403).json({
        success: false,
        message: 'Switch to sender mode to view booking requests',
      });
    }

    const order = await Order.findById(req.params.orderId);
    const orderError = validateSenderOrder(order, req.user.id, {
      requireOpen: false,
    });

    if (orderError) {
      return res.status(orderError.status).json({
        success: false,
        message: orderError.message,
      });
    }

    const requests = await DirectBookingRequest.find({
      order: order._id,
    })
      .populate(
        'traveler',
        'name profilePhoto travelerInfo.isVerified travelerInfo.averageRating travelerInfo.completedDeliveries travelerInfo.trustScore'
      )
      .populate(
        'trip',
        'departureCity departureCountry destinationCity destinationCountry travelDate remainingCapacityKg pricePerKg status'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error('Get order direct requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// GET /api/applications/direct/my-requests
// Traveler sees requests that senders sent directly to them.
const getMyDirectBookingRequests = async (req, res) => {
  try {
    if (req.user.currentMode !== 'traveler') {
      return res.status(403).json({
        success: false,
        message: 'Switch to traveler mode to view booking requests',
      });
    }

    const requests = await DirectBookingRequest.find({
      traveler: req.user.id,
    })
      .populate({
        path: 'order',
        select:
          'sender orderType bookingMethod items totalWeightKg shoppingDetails pickup destination receiver pricing status timeline isPublic createdAt',
        populate: {
          path: 'sender',
          select: 'name profilePhoto',
        },
      })
      .populate(
        'trip',
        'departureCity departureCountry destinationCity destinationCountry travelDate remainingCapacityKg pricePerKg status'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error('Get traveler booking requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// PATCH /api/applications/direct/:requestId/accept
// Traveler accepts a sender's direct request.
const acceptDirectBookingRequest = async (req, res) => {
  try {
    if (req.user.currentMode !== 'traveler') {
      return res.status(403).json({
        success: false,
        message: 'Switch to traveler mode to accept booking requests',
      });
    }

    if (!req.user.travelerInfo?.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Traveler verification is required before accepting orders',
      });
    }

    if (!req.user.isActive || req.user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your traveler account is not currently available',
      });
    }

    const directRequest = await DirectBookingRequest.findById(
      req.params.requestId
    );

    if (!directRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found',
      });
    }

    if (directRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending booking requests can be accepted',
      });
    }

    if (directRequest.traveler.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This booking request was sent to another traveler',
      });
    }

    const order = await Order.findById(directRequest.order);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.traveler || !['created', 'pending'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'This order is no longer available',
      });
    }

    const trip = await Trip.findById(directRequest.trip);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.traveler.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This request is not linked to your trip',
      });
    }

    if (trip.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Your trip is no longer published',
      });
    }

    if (new Date(trip.travelDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Your trip has already passed',
      });
    }

    if (!doesTripMatchOrder(trip, order)) {
      return res.status(400).json({
        success: false,
        message: 'Your trip no longer matches this order route',
      });
    }

    if (!hasEnoughCapacity(trip, order)) {
      return res.status(400).json({
        success: false,
        message: 'Your trip no longer has enough luggage capacity',
      });
    }

    directRequest.status = 'accepted';
    await directRequest.save();

    await Promise.all([
      DirectBookingRequest.updateMany(
        {
          order: order._id,
          _id: { $ne: directRequest._id },
          status: 'pending',
        },
        {
          $set: {
            status: 'rejected',
          },
        }
      ),
      Application.updateMany(
        {
          order: order._id,
          status: 'pending',
        },
        {
          $set: {
            status: 'rejected',
          },
        }
      ),
    ]);

    order.traveler = directRequest.traveler;
    order.trip = directRequest.trip;
    order.status = 'accepted';
    order.isPublic = false;
    order.pricing.travelerFee = directRequest.proposedFee;
    order.timeline.push({
      status: 'accepted',
      note: 'Traveler accepted direct booking request',
    });

    await order.save();

    const orderHub = await OrderHub.findOneAndUpdate(
      { order: order._id },
      {
        $setOnInsert: {
          order: order._id,
          messages: [],
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Booking request accepted successfully',
      request: directRequest,
      order,
      orderHub,
    });
  } catch (error) {
    console.error('Accept direct booking request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// PATCH /api/applications/direct/:requestId/reject
// Traveler rejects a direct request. The marketplace listing remains untouched.
const rejectDirectBookingRequest = async (req, res) => {
  try {
    if (req.user.currentMode !== 'traveler') {
      return res.status(403).json({
        success: false,
        message: 'Switch to traveler mode to reject booking requests',
      });
    }

    const directRequest = await DirectBookingRequest.findById(
      req.params.requestId
    );

    if (!directRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found',
      });
    }

    if (directRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending booking requests can be rejected',
      });
    }

    if (directRequest.traveler.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This booking request was sent to another traveler',
      });
    }

    directRequest.status = 'rejected';
    await directRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Booking request rejected successfully',
      request: directRequest,
    });
  } catch (error) {
    console.error('Reject direct booking request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getDirectBookingOptions,
  sendDirectBookingRequest,
  getOrderDirectBookingRequests,
  getMyDirectBookingRequests,
  acceptDirectBookingRequest,
  rejectDirectBookingRequest,
};
