const mongoose = require("mongoose");

const restrictedItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "Prohibited",
        "Restricted",
        "Fragile",
        "Dangerous",
      ],
      default: "Prohibited",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RestrictedItem",
  restrictedItemSchema
);