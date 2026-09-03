const Order = require('../models/Order');

const TRACKING_STAGES = [
  'created',
  'pending',
  'accepted',
  'payment_held',
  'pickup_scheduled',
  'collected',
  'in_transit',
  'arrived',
  'delivered',
  'payment_released',
  'completed',
];

function canAccessOrder(order, userId) {
  const senderId = order.sender?._id || order.sender;
  const travelerId = order.traveler?._id || order.traveler;
  const isSender = senderId?.toString() === userId;
  const isTraveler = travelerId?.toString() === userId;
  return isSender || isTraveler;
}

const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('sender', 'name email')
      .populate('traveler', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!canAccessOrder(order, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this order tracking',
      });
    }

    return res.status(200).json({
      success: true,
      order,
      stages: TRACKING_STAGES,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!canAccessOrder(order, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this order',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(409).json({
        success: false,
        message: 'A cancelled order cannot continue through the tracking timeline',
      });
    }

    const currentIndex = TRACKING_STAGES.indexOf(order.status);
    const nextStatus = TRACKING_STAGES[currentIndex + 1];

    if (!TRACKING_STAGES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid tracking status' });
    }

    if (!nextStatus) {
      return res.status(409).json({ success: false, message: 'Order is already completed' });
    }

    if (status !== nextStatus) {
      return res.status(409).json({
        success: false,
        message: `The next valid status is ${nextStatus}`,
        nextStatus,
      });
    }

    const cleanNote = typeof note === 'string' ? note.trim().slice(0, 250) : '';
    order.status = status;
    order.timeline.push({
      status,
      note: cleanNote || `Order status changed to ${status.replaceAll('_', ' ')}`,
    });
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
      nextStatus: TRACKING_STAGES[TRACKING_STAGES.indexOf(status) + 1] || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  TRACKING_STAGES,
  getOrderTracking,
  updateOrderStatus,
};
