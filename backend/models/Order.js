const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },

  orderType: { type: String, enum: ['parcel', 'shopping'], required: true },
  bookingMethod: { type: String, enum: ['direct', 'public'], required: true },

  items: [{ name: String, description: String, weightKg: Number }],
  totalWeightKg: { type: Number },

  shoppingDetails: {
    productLink: String,
    quantity: Number,
    budget: Number,
    specialInstructions: String
  },

  pickup: { city: String, country: String },
  destination: { city: String, country: String },

  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },

  pricing: {
    travelerFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },

  status: {
    type: String,
    enum: ['created', 'pending', 'accepted', 'payment_held', 'pickup_scheduled',
           'collected', 'in_transit', 'arrived', 'delivered', 'payment_released',
           'completed', 'cancelled'],
    default: 'created'
  },

  timeline: [{
    status: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],

  otp: {
    code: { type: String },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  },

  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);