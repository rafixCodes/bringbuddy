const Order = require('../models/Order');
const Trip = require('../models/Trip');

// TEMPORARY — hardcoded keyword list, standing in for real Feature 17
// (Restricted Items) until that branch's RestrictedItem model is
// reconciled and merged onto the current schema. Replace this array with
// a real DB query against the RestrictedItem collection once that lands.
// See INDEX.md for the deferred-work decision this stands in for.
const RESTRICTED_KEYWORDS = [
  'weapon', 'gun', 'firearm', 'ammunition', 'explosive', 'bomb',
  'drug', 'narcotic', 'cocaine', 'cannabis',
  'cash', 'currency',
  'alcohol', 'liquor', 'wine',
  'lithium', 'battery', 'flammable',
];

function findRestrictedKeyword(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  return RESTRICTED_KEYWORDS.find((word) => lower.includes(word)) || null;
}

// Create Order — branches on orderType (parcel vs. shopping) for the
// body shape it expects, matching Order.js's schema. trip is OPTIONAL —
// only present when the sender arrived here via a "Request This Traveler"
// action from Search (Feature 6) with a specific trip already picked.
// A sender starting cold (no trip picked) creates a public-marketplace
// order instead, with trip left null — matching happens later via
// Applications (Feature 8), not by attaching a trip at creation time.
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
      tripId,
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
      for (const item of items) {
        const hit = findRestrictedKeyword(item.name) || findRestrictedKeyword(item.description);
        if (hit) {
          return res.status(400).json({
            success: false,
            message: `Item appears to match a restricted category ("${hit}"). Please review BringBuddy's restricted items policy.`,
          });
        }
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

    // If a specific trip was picked (Direct Request path), validate it's
    // real and actually accepting requests before attaching it — a stale
    // or cancelled trip shouldn't silently get attached to a new order.
    let trip = null;
    if (tripId) {
      trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'The selected trip could not be found',
        });
      }
      if (trip.status !== 'published') {
        return res.status(400).json({
          success: false,
          message: 'This trip is no longer accepting requests',
        });
      }
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
      trip: trip ? trip._id : null,
      timeline: [{ status: 'created', note: 'Order created' }],
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