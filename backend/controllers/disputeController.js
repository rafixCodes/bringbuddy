const Dispute = require('../models/Dispute');
const Order = require('../models/Order');


// Allowed dispute reasons
const ALLOWED_REASONS = [
  'damaged_item',
  'payment_issue',
  'misconduct',
  'other'
];


// =====================================================
// CREATE DISPUTE
// POST /api/disputes
// =====================================================
const createDispute = async (req, res) => {
  try {
    const {
      orderId,
      reason,
      description,
      evidenceUrls
    } = req.body;

    if (!orderId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'orderId, reason and description are required'
      });
    }

    if (!ALLOWED_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid reason. Use damaged_item, payment_issue, misconduct or other'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isSender =
      order.sender.toString() === req.user.id;

    const isTraveler =
      order.traveler &&
      order.traveler.toString() === req.user.id;

    if (!isSender && !isTraveler) {
      return res.status(403).json({
        success: false,
        message: 'You cannot raise a dispute for this order'
      });
    }

    if (
      evidenceUrls !== undefined &&
      !Array.isArray(evidenceUrls)
    ) {
      return res.status(400).json({
        success: false,
        message: 'evidenceUrls must be an array'
      });
    }

    const dispute = await Dispute.create({
      order: order._id,
      raisedBy: req.user.id,
      reason,
      description: description.trim(),
      evidenceUrls: evidenceUrls || []
    });

    return res.status(201).json({
      success: true,
      message: 'Dispute raised successfully',
      dispute
    });

  } catch (error) {
    console.error('Create dispute error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


// =====================================================
// GET MY DISPUTES
// GET /api/disputes/my
// =====================================================
const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      raisedBy: req.user.id
    })
      .populate(
        'order',
        'orderType bookingMethod status pickup destination'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: disputes.length,
      disputes
    });

  } catch (error) {
    console.error('Get my disputes error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


// =====================================================
// GET ONE DISPUTE
// GET /api/disputes/:id
// =====================================================
const getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate(
        'order',
        'sender traveler orderType bookingMethod status pickup destination'
      )
      .populate(
        'raisedBy',
        'name email'
      )
      .populate(
        'resolvedBy',
        'name email'
      );

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const order = dispute.order;

    const isAdmin =
      req.user.accountType === 'admin';

    const isSender =
      order.sender &&
      order.sender.toString() === req.user.id;

    const isTraveler =
      order.traveler &&
      order.traveler.toString() === req.user.id;

    if (!isAdmin && !isSender && !isTraveler) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this dispute'
      });
    }

    return res.status(200).json({
      success: true,
      dispute
    });

  } catch (error) {
    console.error('Get dispute error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dispute ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


// =====================================================
// GET ALL DISPUTES - ADMIN
// GET /api/disputes
// =====================================================
const getAllDisputes = async (req, res) => {
  try {
    if (req.user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const disputes = await Dispute.find()
      .populate(
        'raisedBy',
        'name email'
      )
      .populate(
        'order',
        'sender traveler orderType status pickup destination'
      )
      .populate(
        'resolvedBy',
        'name email'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: disputes.length,
      disputes
    });

  } catch (error) {
    console.error('Get all disputes error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


// =====================================================
// MARK DISPUTE UNDER REVIEW - ADMIN
// PATCH /api/disputes/:id/review
// =====================================================
const markUnderReview = async (req, res) => {
  try {
    if (req.user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    if (dispute.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Resolved disputes cannot be reopened'
      });
    }

    dispute.status = 'under_review';

    await dispute.save();

    return res.status(200).json({
      success: true,
      message: 'Dispute marked as under review',
      dispute
    });

  } catch (error) {
    console.error('Mark dispute under review error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dispute ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


// =====================================================
// RESOLVE DISPUTE - ADMIN
// PATCH /api/disputes/:id/resolve
// =====================================================
const resolveDispute = async (req, res) => {
  try {
    if (req.user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { adminNotes } = req.body;

    if (!adminNotes || !adminNotes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'adminNotes are required to resolve a dispute'
      });
    }

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    if (dispute.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Dispute has already been resolved'
      });
    }

    dispute.status = 'resolved';
    dispute.adminNotes = adminNotes.trim();
    dispute.resolvedBy = req.user.id;
    dispute.resolvedAt = new Date();

    await dispute.save();

    return res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      dispute
    });

  } catch (error) {
    console.error('Resolve dispute error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dispute ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


module.exports = {
  createDispute,
  getMyDisputes,
  getDisputeById,
  getAllDisputes,
  markUnderReview,
  resolveDispute
};