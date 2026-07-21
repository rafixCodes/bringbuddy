const express = require('express');
const router = express.Router();
const { getTravelerProfile } = require('../controllers/travelerController');

router.get('/:id', getTravelerProfile);

module.exports = router;