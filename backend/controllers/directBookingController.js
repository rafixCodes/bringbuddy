const mongoose = require('mongoose');

const Application = require('../models/Application');
const DirectBookingRequest = require('../models/DirectBookingRequest');
const Order = require('../models/Order');
const OrderHub = require('../models/OrderHub');
const Trip = require('../models/Trip');
const User = require('../models/User');

const {
  doesTripMatchOrder,
  getActiveOrderLimit,
  countActiveOrders,
  validateTripCapacity,
  deductTripCapacity,
  createHttpError,
} = require('../utils/bookingHelpers');

function validateFee(value) {
  const fee = Number(value);

  if (!Number.isFinite(fee) || fee <= 0) {
    return null;
  }

  return fee;
}

function isOrderOpen(order) {
  return (
    !order.traveler &&
    ['created', 'pending'].includes(order.status)
  );
}

// GET /api/applications/direct/options/:orderId
const getDirectBookingOptions = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          'You are not allowed to find travelers for this order',
      });
    }

    if (!isOrderOpen(order)) {
      return res.status(409).json({
        success: false,
        message:
          'This order already has a traveler or is no longer available',
      });
    }

    const trips = await Trip.find({
      status: 'published',
      travelDate: { $gte: new Date() },
    })
      .populate(
        'traveler',
        'name profilePhoto travelerInfo.isVerified travelerInfo.averageRating travelerInfo.completedDeliveries travelerInfo.trustScore travelerInfo.defaultCarryingFeePerKg isActive isSuspended'
      )
      .sort({ travelDate: 1 });

    const existingRequests = await DirectBookingRequest.find({
      order: order._id,
      status: 'pending',
    }).select('traveler');

    const requestedTravelerIds = new Set(
      existingRequests.map((request) =>
        request.traveler.toString()
      )
    );

    const options = [];

    for (const trip of trips) {
      const traveler = trip.traveler;

      if (!traveler) continue;

      if (
        traveler._id.toString() === req.user.id.toString()
      ) {
        continue;
      }

      if (
        !traveler.isActive ||
        traveler.isSuspended ||
        !traveler.travelerInfo?.isVerified
      ) {
        continue;
      }

      if (
        requestedTravelerIds.has(traveler._id.toString())
      ) {
        continue;
      }

      if (!doesTripMatchOrder(trip, order)) {
        continue;
      }

      try {
        validateTripCapacity(trip, order);
      } catch {
        continue;
      }

      const activeOrderCount = await countActiveOrders(
        traveler._id
      );

      const activeOrderLimit = getActiveOrderLimit(traveler);

      if (activeOrderCount >= activeOrderLimit) {
        continue;
      }

      options.push({
        trip,
        traveler,
        activeOrderCount,
        activeOrderLimit,
      });
    }

    return res.status(200).json({
      success: true,
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
      count: options.length,
      options,
    });
  } catch (error) {
    console.error('Get direct booking options error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// POST /api/applications/direct/:orderId
const sendDirectBookingRequest = async (req, res) => {
  try {
    const {
      tripId,
      proposedFee,
      message = '',
    } = req.body;

    const numericFee = validateFee(proposedFee);

    if (
      !mongoose.isValidObjectId(req.params.orderId) ||
      !mongoose.isValidObjectId(tripId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid order and trip are required',
      });
    }

    if (numericFee === null) {
      return res.status(400).json({
        success: false,
        message: 'Proposed fee must be greater than 0',
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          'You are not allowed to send a request for this order',
      });
    }

    if (!isOrderOpen(order)) {
      return res.status(409).json({
        success: false,
        message:
          'This order already has a traveler or is no longer available',
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
      return res.status(409).json({
        success: false,
        message: 'This trip is no longer available',
      });
    }

    if (
      trip.traveler.toString() === req.user.id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a booking request to yourself',
      });
    }

    const traveler = await User.findById(trip.traveler);

    if (!traveler) {
      return res.status(404).json({
        success: false,
        message: 'Traveler not found',
      });
    }

    if (
      !traveler.isActive ||
      traveler.isSuspended ||
      !traveler.travelerInfo?.isVerified
    ) {
      return res.status(403).json({
        success: false,
        message:
          'This traveler is not currently eligible to receive requests',
      });
    }

    if (!doesTripMatchOrder(trip, order)) {
      return res.status(400).json({
        success: false,
        message: 'This trip does not match the order route',
      });
    }

    try {
      validateTripCapacity(trip, order);
    } catch (error) {
      return res.status(error.statusCode || 409).json({
        success: false,
        message: error.message,
      });
    }

    const activeOrderCount = await countActiveOrders(
      traveler._id
    );

    const activeOrderLimit = getActiveOrderLimit(traveler);

    if (activeOrderCount >= activeOrderLimit) {
      return res.status(409).json({
        success: false,
        message: `Traveler has reached the active-order limit of ${activeOrderLimit}`,
      });
    }

    const existingRequest =
      await DirectBookingRequest.findOne({
        order: order._id,
        traveler: traveler._id,
        status: 'pending',
      });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message:
          'A pending request has already been sent to this traveler',
      });
    }

    const directRequest =
      await DirectBookingRequest.create({
        order: order._id,
        sender: req.user.id,
        traveler: traveler._id,
        trip: trip._id,
        proposedFee: numericFee,
        message: String(message).trim().slice(0, 500),
      });

    if (order.status === 'created') {
      order.status = 'pending';
    }

    order.timeline.push({
      status: 'pending',
      note: 'Direct booking request sent to traveler',
    });

    await order.save();

    const populatedRequest =
      await DirectBookingRequest.findById(directRequest._id)
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
      message: 'Direct booking request sent successfully',
      request: populatedRequest,
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
const getOrderDirectBookingRequests = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          'You are not allowed to view requests for this order',
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
    console.error(
      'Get order direct booking requests error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// GET /api/applications/direct/my-requests
const getMyDirectBookingRequests = async (req, res) => {
  try {
    if (req.user.currentMode !== 'traveler') {
      return res.status(403).json({
        success: false,
        message:
          'Switch to traveler mode to view booking requests',
      });
    }

    const requests = await DirectBookingRequest.find({
      traveler: req.user.id,
    })
      .populate(
        'sender',
        'name profilePhoto'
      )
      .populate(
        'order',
        'orderType bookingMethod pickup destination totalWeightKg shoppingDetails status pricing isPublic'
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
    console.error(
      'Get my direct booking requests error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// PATCH /api/applications/direct/:requestId/accept
const acceptDirectBookingRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let acceptedRequest;
    let acceptedOrder;

    await session.withTransaction(async () => {
      const directRequest =
        await DirectBookingRequest.findById(
          req.params.requestId
        ).session(session);

      if (!directRequest) {
        throw createHttpError(
          'Direct booking request not found',
          404
        );
      }

      if (
        directRequest.traveler.toString() !==
        req.user.id.toString()
      ) {
        throw createHttpError(
          'This request was sent to another traveler',
          403
        );
      }

      if (req.user.currentMode !== 'traveler') {
        throw createHttpError(
          'Switch to traveler mode to accept booking requests',
          403
        );
      }

      if (!req.user.travelerInfo?.isVerified) {
        throw createHttpError(
          'Traveler verification is required before accepting orders',
          403
        );
      }

      if (directRequest.status !== 'pending') {
        throw createHttpError(
          'Only pending booking requests can be accepted',
          409
        );
      }

      const order = await Order.findById(
        directRequest.order
      ).session(session);

      if (!order) {
        throw createHttpError('Order not found', 404);
      }

      if (!isOrderOpen(order)) {
        throw createHttpError(
          'This order already has a traveler or is no longer available',
          409
        );
      }

      const traveler = await User.findById(
        directRequest.traveler
      ).session(session);

      if (!traveler) {
        throw createHttpError('Traveler not found', 404);
      }

      if (
        !traveler.isActive ||
        traveler.isSuspended ||
        !traveler.travelerInfo?.isVerified
      ) {
        throw createHttpError(
          'This traveler is not eligible to accept orders',
          403
        );
      }

      const activeOrderCount = await countActiveOrders(
        traveler._id,
        session
      );

      const activeOrderLimit = getActiveOrderLimit(traveler);

      if (activeOrderCount >= activeOrderLimit) {
        throw createHttpError(
          `You have reached your active-order limit of ${activeOrderLimit}`,
          409
        );
      }

      const trip = await Trip.findById(
        directRequest.trip
      ).session(session);

      if (!trip) {
        throw createHttpError('Trip not found', 404);
      }

      if (
        trip.traveler.toString() !==
          traveler._id.toString() ||
        trip.status !== 'published'
      ) {
        throw createHttpError(
          'The selected trip is no longer available',
          409
        );
      }

      if (!doesTripMatchOrder(trip, order)) {
        throw createHttpError(
          'The selected trip no longer matches this order',
          409
        );
      }

      deductTripCapacity(trip, order);
      await trip.save({ session });

      directRequest.status = 'accepted';
      await directRequest.save({ session });

      await DirectBookingRequest.updateMany(
        {
          order: order._id,
          _id: { $ne: directRequest._id },
          status: 'pending',
        },
        {
          $set: { status: 'rejected' },
        },
        { session }
      );

      await Application.updateMany(
        {
          order: order._id,
          status: 'pending',
        },
        {
          $set: { status: 'rejected' },
        },
        { session }
      );

      order.traveler = traveler._id;
      order.trip = trip._id;
      order.status = 'accepted';
      order.isPublic = false;
      order.pricing.travelerFee =
        directRequest.proposedFee;

      order.timeline.push({
        status: 'accepted',
        note: 'Direct booking request accepted by traveler',
      });

      await order.save({ session });

      await OrderHub.findOneAndUpdate(
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
          session,
        }
      );

      acceptedRequest = directRequest;
      acceptedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: 'Direct booking request accepted',
      request: acceptedRequest,
      order: acceptedOrder,
    });
  } catch (error) {
    console.error(
      'Accept direct booking request error:',
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Internal Server Error',
    });
  } finally {
    await session.endSession();
  }
};

// PATCH /api/applications/direct/:requestId/reject
const rejectDirectBookingRequest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking request ID',
      });
    }

    const directRequest =
      await DirectBookingRequest.findById(
        req.params.requestId
      );

    if (!directRequest) {
      return res.status(404).json({
        success: false,
        message: 'Direct booking request not found',
      });
    }

    if (
      directRequest.traveler.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'This booking request was sent to another traveler',
      });
    }

    if (directRequest.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message:
          'Only pending booking requests can be rejected',
      });
    }

    directRequest.status = 'rejected';
    await directRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Direct booking request rejected',
      request: directRequest,
    });
  } catch (error) {
    console.error(
      'Reject direct booking request error:',
      error
    );

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