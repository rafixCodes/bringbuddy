const express = require('express');
const router = express.Router();

const {
  createTrip,
  getMyTrips,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');

const { protect } = require('../middleware/authMiddleware');

// Create a new trip
router.post('/', protect, createTrip);

// Get logged-in user's trips
router.get('/', protect, getMyTrips);

// Update a trip
router.put('/:id', protect, updateTrip);

// Delete a trip
router.delete('/:id', protect, deleteTrip);

module.exports = router;