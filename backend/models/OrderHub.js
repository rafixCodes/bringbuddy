const mongoose = require('mongoose');

const orderHubSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    attachmentUrl: { type: String },
    attachmentType: { type: String, enum: ['image', 'receipt', 'other'] },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('OrderHub', orderHubSchema);