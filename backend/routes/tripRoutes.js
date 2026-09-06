const express = require('express');
const router = express.Router();

const {
  createTrip,
  getMyTrips,
  updateTrip,
  deleteTrip,
  searchTrips
} = require('../controllers/tripController');

const { protect } = require('../middleware/authMiddleware');

// Search all published trips (Feature 6) — any logged-in user (sender or
// traveler), not scoped to the requester's own trips like GET '/' below.
router.get('/search', protect, searchTrips);

// Create a new trip
router.post('/', protect, createTrip);

// Get logged-in user's trips
router.get('/', protect, getMyTrips);

// Update a trip
router.put('/:id', protect, updateTrip);

// Delete a trip
router.delete('/:id', protect, deleteTrip);

module.exports = router;