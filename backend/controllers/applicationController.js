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

const {
  createNotification,
  createNotifications,
} = require('../utils/notificationHelper');

// POST /api/applications/:orderId
const applyToOrder = async (req, res) => {
  try {
    const {
      tripId,
      proposedFee,
      message = '',
    } = req.body;

    const numericFee = Number(proposedFee);

    if (
      req.user.currentMode !== 'traveler'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Switch to traveler mode before applying to an order',
      });
    }

    if (
      !req.user.travelerInfo?.isVerified
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Traveler verification is required before applying to orders',
      });
    }

    if (
      !mongoose.isValidObjectId(
        req.params.orderId
      ) ||
      !mongoose.isValidObjectId(tripId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'A valid order and trip are required',
      });
    }

    if (
      !Number.isFinite(numericFee) ||
      numericFee <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Proposed fee must be greater than 0',
      });
    }

    const order = await Order.findById(
      req.params.orderId
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (
      order.bookingMethod !== 'public' ||
      !order.isPublic ||
      order.traveler ||
      !['created', 'pending'].includes(
        order.status
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          'This order is no longer accepting applications',
      });
    }

    if (
      order.sender.toString() ===
      req.user.id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'You cannot apply to your own order',
      });
    }

    const trip = await Trip.findById(
      tripId
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (
      trip.traveler.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You can only apply using your own trip',
      });
    }

    if (trip.status !== 'published') {
      return res.status(409).json({
        success: false,
        message:
          'Only published trips can be used to apply',
      });
    }

    if (!doesTripMatchOrder(trip, order)) {
      return res.status(400).json({
        success: false,
        message:
          'This trip does not match the order route',
      });
    }

    try {
      validateTripCapacity(trip, order);
    } catch (error) {
      return res
        .status(error.statusCode || 400)
        .json({
          success: false,
          message: error.message,
        });
    }

    const application =
      await Application.create({
        order: order._id,
        traveler: req.user.id,
        trip: trip._id,
        proposedFee: numericFee,
        message: String(message)
          .trim()
          .slice(0, 500),
      });

    if (order.status === 'created') {
      order.status = 'pending';

      order.timeline.push({
        status: 'pending',
        note:
          'Traveler application received',
      });

      await order.save();
    }

    await createNotification({
      user: order.sender,
      type: 'booking',
      title:
        'New marketplace application',
      message:
        `${req.user.name} applied to carry your order ` +
        `from ${order.pickup.city} to ` +
        `${order.destination.city}.`,
      relatedOrder: order._id,
      actionUrl: '/booking-center',
    });

    return res.status(201).json({
      success: true,
      message:
        'Application submitted successfully',
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          'You have already applied to this order',
      });
    }

    console.error(
      'Apply to order error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// GET /api/applications/order/:orderId
const getOrderApplications = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.orderId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(
      req.params.orderId
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (
      order.sender.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not allowed to view applications for this order',
      });
    }

    const applications =
      await Application.find({
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
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      'Get order applications error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// GET /api/applications/my-applications
const getMyApplications = async (
  req,
  res
) => {
  try {
    const applications =
      await Application.find({
        traveler: req.user.id,
      })
        .populate(
          'order',
          'orderType bookingMethod pickup destination totalWeightKg status pricing isPublic'
        )
        .populate(
          'trip',
          'departureCity departureCountry destinationCity destinationCountry travelDate status'
        )
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      'Get my applications error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// PATCH /api/applications/:applicationId/accept
const acceptApplication = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    let acceptedApplication;
    let acceptedOrder;

    await session.withTransaction(
      async () => {
        const application =
          await Application.findById(
            req.params.applicationId
          ).session(session);

        if (!application) {
          throw createHttpError(
            'Application not found',
            404
          );
        }

        if (
          application.status !== 'pending'
        ) {
          throw createHttpError(
            'Only pending applications can be accepted',
            409
          );
        }

        const order = await Order.findById(
          application.order
        ).session(session);

        if (!order) {
          throw createHttpError(
            'Order not found',
            404
          );
        }

        if (
          order.sender.toString() !==
          req.user.id.toString()
        ) {
          throw createHttpError(
            'You are not allowed to accept this application',
            403
          );
        }

        if (
          order.bookingMethod !==
            'public' ||
          order.traveler ||
          ![
            'created',
            'pending',
          ].includes(order.status)
        ) {
          throw createHttpError(
            'This order already has a traveler or is no longer available',
            409
          );
        }

        const traveler =
          await User.findById(
            application.traveler
          ).session(session);

        if (!traveler) {
          throw createHttpError(
            'Traveler account not found',
            404
          );
        }

        if (
          !traveler.isActive ||
          traveler.isSuspended ||
          !traveler.travelerInfo
            ?.isVerified
        ) {
          throw createHttpError(
            'This traveler is not eligible to accept orders',
            403
          );
        }

        const activeOrderCount =
          await countActiveOrders(
            traveler._id,
            session
          );

        const activeOrderLimit =
          getActiveOrderLimit(traveler);

        if (
          activeOrderCount >=
          activeOrderLimit
        ) {
          throw createHttpError(
            `Traveler has reached the active-order limit of ${activeOrderLimit}`,
            409
          );
        }

        const trip = await Trip.findById(
          application.trip
        ).session(session);

        if (!trip) {
          throw createHttpError(
            'Traveler trip not found',
            404
          );
        }

        if (
          trip.traveler.toString() !==
            traveler._id.toString() ||
          trip.status !== 'published'
        ) {
          throw createHttpError(
            'Traveler trip is no longer available',
            409
          );
        }

        if (
          !doesTripMatchOrder(
            trip,
            order
          )
        ) {
          throw createHttpError(
            'Traveler trip no longer matches this order',
            409
          );
        }

        deductTripCapacity(
          trip,
          order
        );

        await trip.save({ session });

        const [
          otherApplications,
          pendingDirectRequests,
        ] = await Promise.all([
          Application.find({
            order: order._id,
            _id: {
              $ne: application._id,
            },
            status: 'pending',
          })
            .select('traveler')
            .session(session),

          DirectBookingRequest.find({
            order: order._id,
            status: 'pending',
          })
            .select('traveler')
            .session(session),
        ]);

        const rejectedTravelerIds = [
          ...new Set(
            [
              ...otherApplications,
              ...pendingDirectRequests,
            ].map((item) =>
              item.traveler.toString()
            )
          ),
        ].filter(
          (travelerId) =>
            travelerId !==
            traveler._id.toString()
        );

        application.status = 'accepted';

        await application.save({
          session,
        });

        await Application.updateMany(
          {
            order: order._id,
            _id: {
              $ne: application._id,
            },
            status: 'pending',
          },
          {
            $set: {
              status: 'rejected',
            },
          },
          { session }
        );

        await DirectBookingRequest.updateMany(
          {
            order: order._id,
            status: 'pending',
          },
          {
            $set: {
              status: 'rejected',
            },
          },
          { session }
        );

        order.traveler = traveler._id;
        order.trip = trip._id;
        order.status = 'accepted';
        order.isPublic = false;
        order.pricing.travelerFee =
          application.proposedFee;

        order.timeline.push({
          status: 'accepted',
          note:
            'Traveler selected through marketplace application',
        });

        await order.save({ session });

        await OrderHub.findOneAndUpdate(
          {
            order: order._id,
          },
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

        await createNotification(
          {
            user: traveler._id,
            type: 'booking',
            title:
              'Application accepted',
            message:
              `Your application for the ` +
              `${order.pickup.city} to ` +
              `${order.destination.city} order was accepted.`,
            relatedOrder: order._id,
            actionUrl:
              '/booking-center',
          },
          session
        );

        await createNotifications(
          rejectedTravelerIds.map(
            (travelerId) => ({
              user: travelerId,
              type: 'booking',
              title:
                'Order assigned to another traveler',
              message:
                `The ${order.pickup.city} to ` +
                `${order.destination.city} order is no longer available.`,
              relatedOrder:
                order._id,
              actionUrl:
                '/booking-center',
            })
          ),
          session
        );

        acceptedApplication =
          application;

        acceptedOrder = order;
      }
    );

    return res.status(200).json({
      success: true,
      message:
        'Application accepted successfully',
      application:
        acceptedApplication,
      order: acceptedOrder,
    });
  } catch (error) {
    console.error(
      'Accept application error:',
      error
    );

    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: error.statusCode
          ? error.message
          : 'Internal Server Error',
      });
  } finally {
    await session.endSession();
  }
};

// PATCH /api/applications/:applicationId/reject
const rejectApplication = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.applicationId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid application ID',
      });
    }

    const application =
      await Application.findById(
        req.params.applicationId
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const order = await Order.findById(
      application.order
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (
      order.sender.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not allowed to reject this application',
      });
    }

    if (
      application.status !== 'pending'
    ) {
      return res.status(409).json({
        success: false,
        message:
          'Only pending applications can be rejected',
      });
    }

    application.status = 'rejected';

    await application.save();

    await createNotification({
      user: application.traveler,
      type: 'booking',
      title:
        'Application not selected',
      message:
        `Your application for the ` +
        `${order.pickup.city} to ` +
        `${order.destination.city} order was not selected.`,
      relatedOrder: order._id,
      actionUrl: '/booking-center',
    });

    return res.status(200).json({
      success: true,
      message:
        'Application rejected successfully',
      application,
    });
  } catch (error) {
    console.error(
      'Reject application error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  applyToOrder,
  getOrderApplications,
  getMyApplications,
  acceptApplication,
  rejectApplication,
};