const Order = require('../models/Order');
const { validateDescriptions } = require('../utils/restrictedItemValidator');

// Create Order — branches on orderType (parcel vs. shopping) for the
// body shape it expects, matching Order.js's schema. trip is intentionally
// NOT required here — booking/matching to a specific trip happens later,
// in Feature 8 (Booking/Applications), not at order-creation time.
const createOrder = async (req, res) => {
  try {
    const {
      orderType,
      bookingMethod,
      items,
      totalWeightKg,
      shoppingDetails,
      pickup,
      destination,
      receiver,
      isPublic,
      restrictedItemAcknowledged,
    } = req.body;

    if (!orderType || !['parcel', 'shopping'].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: 'A valid orderType (parcel or shopping) is required',
      });
    }

    if (!bookingMethod || !['direct', 'public'].includes(bookingMethod)) {
      return res.status(400).json({
        success: false,
        message: 'A valid bookingMethod (direct or public) is required',
      });
    }

    if (!receiver || !receiver.name || !receiver.phone || !receiver.address) {
      return res.status(400).json({
        success: false,
        message: 'Receiver name, phone, and address are all required',
      });
    }

    if (!pickup || !pickup.city || !pickup.country) {
      return res.status(400).json({
        success: false,
        message: 'Pickup city and country are required',
      });
    }

    if (!destination || !destination.city || !destination.country) {
      return res.status(400).json({
        success: false,
        message: 'Destination city and country are required',
      });
    }

    // Type-specific validation
    if (orderType === 'parcel') {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one item is required for a parcel order',
        });
      }
    }

    if (orderType === 'shopping') {
      if (!shoppingDetails || !shoppingDetails.productLink || !shoppingDetails.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product link and quantity are required for a shopping order',
        });
      }
    }

    const descriptions = orderType === 'parcel'
      ? items.flatMap((item) => [item.name, item.description])
      : [shoppingDetails.productLink, shoppingDetails.specialInstructions];
    const restrictedValidation = await validateDescriptions(descriptions);

    if (!restrictedValidation.allowed) {
      return res.status(400).json({
        success: false,
        code: 'PROHIBITED_ITEM',
        message: `Order blocked: ${restrictedValidation.blockedItems.map((item) => item.name).join(', ')}`,
        validation: restrictedValidation,
      });
    }

    if (restrictedValidation.requiresAcknowledgement && restrictedItemAcknowledged !== true) {
      return res.status(409).json({
        success: false,
        code: 'RESTRICTED_ITEM_WARNING',
        message: 'This order contains a restricted category. Review the warning before continuing.',
        validation: restrictedValidation,
      });
    }

    const order = await Order.create({
      sender: req.user.id,
      orderType,
      bookingMethod,
      items: orderType === 'parcel' ? items : undefined,
      totalWeightKg,
      shoppingDetails: orderType === 'shopping' ? shoppingDetails : undefined,
      pickup,
      destination,
      receiver,
      isPublic: !!isPublic,
      timeline: [{
        status: 'created',
        note: restrictedValidation.requiresAcknowledgement
          ? 'Order created after restricted-item warning was acknowledged'
          : 'Order created',
      }],
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// Get all orders belonging to the logged-in user (as sender).
// NOTE: doesn't yet cover "orders I'm carrying as a traveler" — Order.js's
// `traveler` field exists but nothing assigns it yet (that's Feature 8).
// Revisit this query once bookings exist.
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sender: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// Get a single order by ID. Only the sender who created it can view it for
// now — once a traveler is assigned (Feature 8) or an order is public
// (isPublic), this access check will need to widen.
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
