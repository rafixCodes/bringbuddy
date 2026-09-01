const express = require('express');
const router = express.Router();

const {
  applyToOrder,
  getOrderApplications,
  getMyApplications,
  acceptApplication,
  rejectApplication,
} = require('../controllers/applicationController');

const { protect } = require('../middleware/authMiddleware');


// Traveler applies to a public order
router.post('/:orderId', protect, applyToOrder);


// Traveler views their own applications
router.get('/my-applications', protect, getMyApplications);


// Sender views applicants for one public order
router.get('/order/:orderId', protect, getOrderApplications);


// Sender accepts an application
router.patch('/:applicationId/accept', protect, acceptApplication);


// Sender rejects an application
router.patch('/:applicationId/reject', protect, rejectApplication);


module.exports = router;