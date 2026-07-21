const Trip = require('../models/Trip');

// ===============================
// Create a New Trip
// ===============================
const createTrip = async (req, res) => {
  try {
    const {
      departureCity,
      departureCountry,
      destinationCity,
      destinationCountry,
      travelDate,
      luggageCapacityKg,
      pricePerKg,
      allowedCategories,
      status
    } = req.body;

    const trip = await Trip.create({
      traveler: req.user._id,
      departureCity,
      departureCountry,
      destinationCity,
      destinationCountry,
      travelDate,
      luggageCapacityKg,
      remainingCapacityKg: luggageCapacityKg,
      pricePerKg,
      allowedCategories,
      status: status || 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create trip',
      error: error.message
    });
  }
};


// ===============================
// Get Logged-in Traveler's Trips
// ===============================
const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      traveler: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get trips',
      error: error.message
    });
  }
};


// ===============================
// Update a Trip
// ===============================
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      traveler: req.user._id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const allowedFields = [
      'departureCity',
      'departureCountry',
      'destinationCity',
      'destinationCountry',
      'travelDate',
      'luggageCapacityKg',
      'remainingCapacityKg',
      'pricePerKg',
      'allowedCategories',
      'status'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        trip[field] = req.body[field];
      }
    });

    const updatedTrip = await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update trip',
      error: error.message
    });
  }
};


// ===============================
// Delete a Trip
// ===============================
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      traveler: req.user._id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete trip',
      error: error.message
    });
  }
};


module.exports = {
  createTrip,
  getMyTrips,
  updateTrip,
  deleteTrip
};