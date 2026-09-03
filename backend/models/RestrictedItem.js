const mongoose = require('mongoose');

const restrictedItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  normalizedName: { type: String, required: true, unique: true, index: true },
  keywords: [{ type: String, trim: true, lowercase: true }],
  category: {
    type: String,
    enum: ['dangerous_goods', 'controlled_substances', 'money', 'alcohol', 'medication', 'other'],
    default: 'other',
  },
  restrictionLevel: {
    type: String,
    enum: ['prohibited', 'restricted'],
    required: true,
  },
  reason: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

restrictedItemSchema.pre('validate', function setNormalizedValues() {
  this.normalizedName = String(this.name || '').trim().toLowerCase();
  this.keywords = [...new Set(
    [this.name, ...(this.keywords || [])]
      .map((keyword) => String(keyword || '').trim().toLowerCase())
      .filter(Boolean)
  )];
});

module.exports = mongoose.model('RestrictedItem', restrictedItemSchema);
