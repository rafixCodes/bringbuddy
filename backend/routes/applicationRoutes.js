const express = require('express');
const router = express.Router();

const {
  applyToOrder,
  getOrderApplications,
  getMyApplications,
  acceptApplication,
  rejectApplication,
} = require('../controllers/applicationController');

const {
  getDirectBookingOptions,
  sendDirectBookingRequest,
  getOrderDirectBookingRequests,
  getMyDirectBookingRequests,
  acceptDirectBookingRequest,
  rejectDirectBookingRequest,
} = require('../controllers/directBookingController');

const { protect } = require('../middleware/authMiddleware');

// Sender manually approaches travelers for an existing order.
router.get('/direct/options/:orderId', protect, getDirectBookingOptions);
router.get('/direct/order/:orderId', protect, getOrderDirectBookingRequests);
router.get('/direct/my-requests', protect, getMyDirectBookingRequests);
router.post('/direct/:orderId', protect, sendDirectBookingRequest);
router.patch('/direct/:requestId/accept', protect, acceptDirectBookingRequest);
router.patch('/direct/:requestId/reject', protect, rejectDirectBookingRequest);

// Public marketplace applications.
router.get('/my-applications', protect, getMyApplications);
router.get('/order/:orderId', protect, getOrderApplications);
router.patch('/:applicationId/accept', protect, acceptApplication);
router.patch('/:applicationId/reject', protect, rejectApplication);
router.post('/:orderId', protect, applyToOrder);

module.exports = router;
