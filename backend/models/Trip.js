const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  departureCity: { type: String, required: true },
  departureCountry: { type: String, required: true },
  destinationCity: { type: String, required: true },
  destinationCountry: { type: String, required: true },
  travelDate: { type: Date, required: true },
  luggageCapacityKg: { type: Number, required: true },
  remainingCapacityKg: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  allowedCategories: [{ type: String }],
  status: { type: String, enum: ['draft', 'published', 'full', 'completed', 'cancelled'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);