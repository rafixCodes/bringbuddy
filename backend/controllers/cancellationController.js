const mongoose = require('mongoose');

const Application = require('../models/Application');
const DirectBookingRequest = require('../models/DirectBookingRequest');
const Order = require('../models/Order');
const Trip = require('../models/Trip');
const User = require('../models/User');

const {
  isOrderCancellable,
  restoreTripCapacity,
  calculateCancellationRate,
} = require('../utils/cancellationHelpers');

const {
  createNotification,
} = require('../utils/notificationHelper');

function sameId(first, second) {
  return (
    first &&
    second &&
    first.toString() === second.toString()
  );
}

// GET /api/cancellations/my
const getMyCancellationOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $and: [
        {
          $or: [
        { sender: req.user.id },
        { traveler: req.user.id },
        { 'cancellation.originalTraveler': req.user.id },
          ],
        },
        {
          $or: [
        {
          status: {
            $in: [
              'created',
              'pending',
              'accepted',
              'payment_held',
              'pickup_scheduled',
            ],
          },
        },
        {
          'cancellation.recoveryStatus': {
            $in: ['awaiting_sender', 'reposted', 'closed'],
          },
        },
          ],
        },
      ],
    })
      .populate('sender', 'name email')
      .populate('traveler', 'name email')
      .populate(
        'cancellation.originalTraveler',
        'name email'
      )
      .populate(
        'trip',
        'departureCity destinationCity travelDate remainingCapacityKg status'
      )
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get cancellation orders error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// POST /api/cancellations/:orderId
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const reason = String(req.body.reason || '').trim();

    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    if (reason.length < 5 || reason.length > 500) {
      return res.status(400).json({
        success: false,
        message:
          'Cancellation reason must contain 5 to 500 characters',
      });
    }

    let updatedOrder;
    let notificationData = null;

    await session.withTransaction(async () => {
      const order = await Order.findById(
        req.params.orderId
      ).session(session);

      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      if (!isOrderCancellable(order.status)) {
        const error = new Error(
          'This order can no longer be cancelled'
        );
        error.statusCode = 409;
        throw error;
      }

      const isSender = sameId(order.sender, req.user.id);
      const isTraveler = sameId(
        order.traveler,
        req.user.id
      );

      if (!isSender && !isTraveler) {
        const error = new Error(
          'You are not allowed to cancel this order'
        );
        error.statusCode = 403;
        throw error;
      }

      if (!order.traveler && !isSender) {
        const error = new Error(
          'Only the sender can cancel an unassigned order'
        );
        error.statusCode = 403;
        throw error;
      }

      const originalTraveler = order.traveler;
      const originalTrip = order.trip;
      let capacityRestored = false;

      if (
        originalTraveler &&
        originalTrip &&
        !order.cancellation?.capacityRestored
      ) {
        const trip = await Trip.findById(
          originalTrip
        ).session(session);

        if (trip) {
          capacityRestored = restoreTripCapacity(
            trip,
            order
          );

          if (capacityRestored) {
            await trip.save({ session });
          }
        }
      }

      order.cancellation = {
        cancelledBy: req.user.id,
        cancelledByRole: isTraveler
          ? 'traveler'
          : 'sender',
        reason,
        cancelledAt: new Date(),
        capacityRestored,
        originalTraveler: originalTraveler || null,
        originalTrip: originalTrip || null,
        recoveryStatus: isTraveler
          ? 'awaiting_sender'
          : 'closed',
      };

      if (isTraveler) {
        const traveler = await User.findById(
          req.user.id
        ).session(session);

        if (traveler) {
          const currentCount = Number(
            traveler.travelerInfo
              ?.cancellationCount || 0
          );

          traveler.travelerInfo.cancellationCount =
            currentCount + 1;

          traveler.travelerInfo.cancellationRate =
            calculateCancellationRate(
              traveler.travelerInfo
                .completedDeliveries,
              traveler.travelerInfo
                .cancellationCount
            );

          traveler.travelerInfo.trustScore =
            Math.max(
              0,
              Number(
                traveler.travelerInfo.trustScore || 0
              ) - 5
            );

          await traveler.save({ session });
        }

        order.status = 'pending';
        order.isPublic = false;
        order.traveler = null;
        order.trip = null;

        order.timeline.push({
          status: 'pending',
          note:
            `Traveler cancelled the booking: ${reason}. ` +
            'Waiting for sender recovery decision.',
        });

        notificationData = {
          user: order.sender,
          type: 'general',
          title: 'Traveler cancelled booking',
          message:
            'Choose another traveler, repost the order, or close it.',
          relatedOrder: order._id,
          actionUrl: '/cancellations',
        };
      } else {
        order.status = 'cancelled';
        order.isPublic = false;
        order.traveler = null;
        order.trip = null;

        order.timeline.push({
          status: 'cancelled',
          note: `Sender cancelled the order: ${reason}`,
        });

        if (originalTraveler) {
          notificationData = {
            user: originalTraveler,
            type: 'general',
            title: 'Order cancelled',
            message:
              'The sender cancelled an assigned order.',
            relatedOrder: order._id,
            actionUrl: '/cancellations',
          };
        }
      }

      await Promise.all([
        Application.updateMany(
          {
            order: order._id,
            status: { $in: ['pending', 'accepted'] },
          },
          { $set: { status: 'rejected' } },
          { session }
        ),
        DirectBookingRequest.updateMany(
          {
            order: order._id,
            status: { $in: ['pending', 'accepted'] },
          },
          { $set: { status: 'rejected' } },
          { session }
        ),
      ]);

      await order.save({ session });
      updatedOrder = order;
    });

    if (notificationData) {
      await createNotification(notificationData);
    }

    return res.status(200).json({
      success: true,
      message:
        updatedOrder.cancellation.cancelledByRole ===
        'traveler'
          ? 'Booking cancelled. Sender recovery is now available.'
          : 'Order cancelled successfully.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Cancel order error:', error);

    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.statusCode
            ? error.message
            : 'Internal Server Error',
      });
  } finally {
    await session.endSession();
  }
};

// POST /api/cancellations/:orderId/recover
const recoverOrder = async (req, res) => {
  try {
    const action = String(req.body.action || '')
      .trim()
      .toLowerCase();

    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    if (!['repost', 'cancel'].includes(action)) {
      return res.status(400).json({
        success: false,
        message:
          'Recovery action must be repost or cancel',
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

    if (!sameId(order.sender, req.user.id)) {
      return res.status(403).json({
        success: false,
        message:
          'Only the sender can choose a recovery action',
      });
    }

    if (
      order.cancellation?.recoveryStatus !==
      'awaiting_sender'
    ) {
      return res.status(409).json({
        success: false,
        message:
          'This order is not awaiting a recovery decision',
      });
    }

    if (action === 'repost') {
      order.status = 'pending';
      order.bookingMethod = 'public';
      order.isPublic = true;
      order.cancellation.recoveryStatus = 'reposted';

      order.timeline.push({
        status: 'pending',
        note:
          'Sender reposted the order to find another traveler',
      });

      await Promise.all([
        Application.deleteMany({ order: order._id }),
        DirectBookingRequest.deleteMany({
          order: order._id,
        }),
      ]);
    } else {
      order.status = 'cancelled';
      order.isPublic = false;
      order.cancellation.recoveryStatus = 'closed';

      order.timeline.push({
        status: 'cancelled',
        note:
          'Sender closed the order after traveler cancellation',
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        action === 'repost'
          ? 'Order reposted successfully'
          : 'Order cancelled permanently',
      order,
    });
  } catch (error) {
    console.error('Recover order error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getMyCancellationOrders,
  cancelOrder,
  recoverOrder,
};
