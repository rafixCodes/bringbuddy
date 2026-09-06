const express = require('express');

const {
  searchTravelerTrips,
} = require('../controllers/travelerSearchController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, searchTravelerTrips);

module.exports = router;
