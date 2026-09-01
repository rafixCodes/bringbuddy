const Application = require('../models/Application');
const Order = require('../models/Order');
const Trip = require('../models/Trip');
const OrderHub = require('../models/OrderHub');
const User = require('../models/User');

const normalizeText = (value) => {
  return String(value || '').trim().toLowerCase();
};

const doesTripMatchOrder = (trip, order) => {
  const sameDeparture =
    normalizeText(trip.departureCity) === normalizeText(order.pickup.city) &&
    normalizeText(trip.departureCountry) === normalizeText(order.pickup.country);

  const sameDestination =
    normalizeText(trip.destinationCity) === normalizeText(order.destination.city) &&
    normalizeText(trip.destinationCountry) === normalizeText(order.destination.country);

  return sameDeparture && sameDestination;
};


// ======================================================
// 1. TRAVELER APPLIES TO A PUBLIC ORDER
// POST /api/applications/:orderId
// ======================================================
const applyToOrder = async (req, res) => {
  try {
    const { tripId, proposedFee, message } = req.body;
    const orderId = req.params.orderId;

    if (req.user.currentMode !== 'traveler') {
      return res.status(403).json({
        success: false,
        message: 'Switch to traveler mode before applying to an order',
      });
    }

    if (!req.user.travelerInfo?.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Traveler verification is required before applying to orders',
      });
    }

    if (!tripId || proposedFee === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Trip and proposed fee are required',
      });
    }

    const numericFee = Number(proposedFee);

    if (!Number.isFinite(numericFee) || numericFee <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Proposed fee must be a valid number greater than 0',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.bookingMethod !== 'public' || !order.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'This order is not open for public applications',
      });
    }

    if (order.traveler || !['created', 'pending'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'This order is no longer accepting applications',
      });
    }

    if (order.sender.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own order',
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.traveler.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only apply using your own trip',
      });
    }

    if (trip.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Only published trips can be used to apply',
      });
    }

    if (!doesTripMatchOrder(trip, order)) {
      return res.status(400).json({
        success: false,
        message: 'This trip does not match the order route',
      });
    }

    if (
      order.orderType === 'parcel' &&
      order.totalWeightKg &&
      trip.remainingCapacityKg < order.totalWeightKg
    ) {
      return res.status(400).json({
        success: false,
        message: 'This trip does not have enough remaining luggage capacity',
      });
    }

    const existingApplication = await Application.findOne({
      order: orderId,
      traveler: req.user.id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this order',
      });
    }

    const application = await Application.create({
      order: orderId,
      traveler: req.user.id,
      trip: tripId,
      proposedFee: numericFee,
      message: message || '',
    });

    if (order.status === 'created') {
      order.status = 'pending';

      order.timeline.push({
        status: 'pending',
        note: 'Traveler application received',
      });

      await order.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });

  } catch (error) {
    console.error('Apply to order error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


// ======================================================
// 2. SENDER VIEWS APPLICATIONS FOR AN ORDER
// GET /api/applications/order/:orderId
// ======================================================
const getOrderApplications = async (req, res) => {
  try {
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
        message: 'You are not allowed to view applications for this order',
      });
    }

    const applications = await Application.find({
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
    console.error('Get order applications error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


// ======================================================
// 3. TRAVELER VIEWS THEIR OWN APPLICATIONS
// GET /api/applications/my-applications
// ======================================================
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
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
    console.error('Get my applications error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


// ======================================================
// 4. SENDER ACCEPTS AN APPLICATION
// PATCH /api/applications/:applicationId/accept
// ======================================================
const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(
      req.params.applicationId
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be accepted',
      });
    }

    const order = await Order.findById(application.order);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to accept this application',
      });
    }

    if (order.bookingMethod !== 'public') {
      return res.status(400).json({
        success: false,
        message: 'Applications can only be accepted for public orders',
      });
    }

    if (order.traveler || !['created', 'pending'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'This order already has a traveler or is no longer available',
      });
    }

    // Re-check traveler verification before final acceptance
    const traveler = await User.findById(application.traveler);

    if (!traveler) {
      return res.status(404).json({
        success: false,
        message: 'Traveler account not found',
      });
    }

    if (!traveler.travelerInfo?.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Only verified travelers can be selected for an order',
      });
    }

    const trip = await Trip.findById(application.trip);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Traveler trip not found',
      });
    }

    if (trip.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Traveler trip is no longer available',
      });
    }

    if (!doesTripMatchOrder(trip, order)) {
      return res.status(400).json({
        success: false,
        message: 'Traveler trip no longer matches this order',
      });
    }

    if (
      order.orderType === 'parcel' &&
      order.totalWeightKg &&
      trip.remainingCapacityKg < order.totalWeightKg
    ) {
      return res.status(400).json({
        success: false,
        message: 'Traveler no longer has enough luggage capacity',
      });
    }

    application.status = 'accepted';
    await application.save();

    await Application.updateMany(
      {
        order: order._id,
        _id: { $ne: application._id },
        status: 'pending',
      },
      {
        $set: {
          status: 'rejected',
        },
      }
    );

    order.traveler = application.traveler;
    order.trip = application.trip;
    order.status = 'accepted';

    // Accepted public order should no longer appear publicly
    order.isPublic = false;

    order.pricing.travelerFee = application.proposedFee;

    order.timeline.push({
      status: 'accepted',
      note: 'Traveler selected and booking accepted',
    });

    await order.save();

    // Create an Order Hub automatically.
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
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Application accepted successfully',
      application,
      order,
    });

  } catch (error) {
    console.error('Accept application error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


// ======================================================
// 5. SENDER REJECTS AN APPLICATION
// PATCH /api/applications/:applicationId/reject
// ======================================================
const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(
      req.params.applicationId
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const order = await Order.findById(application.order);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to reject this application',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be rejected',
      });
    }

    application.status = 'rejected';
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      application,
    });

  } catch (error) {
    console.error('Reject application error:', error);

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