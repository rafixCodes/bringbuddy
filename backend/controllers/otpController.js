const crypto = require('crypto');
const Order = require('../models/Order');

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const ELIGIBLE_STATUSES = new Set([
  'accepted',
  'payment_held',
  'pickup_scheduled',
  'collected',
  'in_transit',
  'arrived',
]);

function hashOtp(code) {
  return crypto
    .createHash('sha256')
    .update(`${code}:${process.env.JWT_SECRET}`)
    .digest('hex');
}

function isParticipant(order, userId) {
  return order.sender?.toString() === userId || order.traveler?.toString() === userId;
}

const getOtpStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select('+otp.code');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!isParticipant(order, req.user.id)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this order' });
    }

    return res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        pickup: order.pickup,
        destination: order.destination,
        receiver: { name: order.receiver.name, phone: order.receiver.phone },
      },
      otp: {
        isGenerated: Boolean(order.otp?.code),
        isVerified: Boolean(order.otp?.isVerified),
        expiresAt: order.otp?.expiresAt || null,
        failedAttempts: order.otp?.failedAttempts || 0,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - (order.otp?.failedAttempts || 0)),
      },
      canGenerate: ELIGIBLE_STATUSES.has(order.status) && !order.otp?.isVerified,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const generateDeliveryOtp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select('+otp.code');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!isParticipant(order, req.user.id)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to generate this OTP' });
    }
    if (!ELIGIBLE_STATUSES.has(order.status)) {
      return res.status(409).json({
        success: false,
        message: 'Delivery OTP can only be generated after an order is accepted and before delivery is confirmed',
      });
    }
    if (order.otp?.isVerified) {
      return res.status(409).json({ success: false, message: 'Delivery is already verified' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    order.otp.code = hashOtp(code);
    order.otp.expiresAt = new Date(Date.now() + OTP_LIFETIME_MS);
    order.otp.failedAttempts = 0;
    order.otp.isVerified = false;
    order.otp.verifiedAt = undefined;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Delivery OTP generated. It expires in 10 minutes.',
      demoOtp: code,
      expiresAt: order.otp.expiresAt,
      receiver: { name: order.receiver.name, phone: order.receiver.phone },
      confirmationPath: `/delivery-confirmation/${order._id}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, code } = req.body;
    if (!orderId || !/^\d{6}$/.test(String(code || ''))) {
      return res.status(400).json({ success: false, message: 'Order ID and a 6-digit OTP are required' });
    }

    const order = await Order.findById(orderId).select('+otp.code');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.otp?.isVerified) {
      return res.status(409).json({ success: false, message: 'Delivery has already been confirmed' });
    }
    if (!order.otp?.code || !order.otp?.expiresAt) {
      return res.status(409).json({ success: false, message: 'No active delivery OTP exists for this order' });
    }
    if (order.otp.failedAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Generate a new OTP.' });
    }
    if (order.otp.expiresAt.getTime() <= Date.now()) {
      return res.status(410).json({ success: false, message: 'This OTP has expired. Generate a new OTP.' });
    }

    const submittedHash = Buffer.from(hashOtp(String(code)));
    const storedHash = Buffer.from(order.otp.code);
    const matches = submittedHash.length === storedHash.length
      && crypto.timingSafeEqual(submittedHash, storedHash);

    if (!matches) {
      order.otp.failedAttempts += 1;
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP',
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - order.otp.failedAttempts),
      });
    }

    order.otp.isVerified = true;
    order.otp.verifiedAt = new Date();
    order.otp.code = undefined;
    order.otp.expiresAt = undefined;
    order.otp.failedAttempts = 0;
    order.status = 'delivered';
    order.timeline.push({
      status: 'delivered',
      note: 'Receiver confirmed delivery using OTP',
    });
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Delivery confirmed successfully',
      orderId: order._id,
      status: order.status,
      verifiedAt: order.otp.verifiedAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = { getOtpStatus, generateDeliveryOtp, verifyDeliveryOtp };
