const RestrictedItem = require("../models/RestrictedItem");

// ==========================================
// Get All Restricted Items
// ==========================================
const getRestrictedItems = async (req, res) => {
  try {
    const items = await RestrictedItem.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Check Submitted Items
// ==========================================
const checkRestrictedItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of items.",
      });
    }

    const restrictedItems = await RestrictedItem.find();

    const blockedItems = [];
    const allowedItems = [];

    items.forEach((item) => {
      const match = restrictedItems.find(
        (restricted) =>
          restricted.name.toLowerCase() === item.toLowerCase()
      );

      if (match) {
        blockedItems.push({
          name: match.name,
          category: match.category,
          reason: match.reason,
        });
      } else {
        allowedItems.push(item);
      }
    });

    res.status(200).json({
      success: true,
      allowed: blockedItems.length === 0,
      blockedItems,
      allowedItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Add Restricted Item (Admin)
// ==========================================
const addRestrictedItem = async (req, res) => {
  try {
    const { name, category, reason } = req.body;

    const exists = await RestrictedItem.findOne({ name });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Restricted item already exists.",
      });
    }

    const item = await RestrictedItem.create({
      name,
      category,
      reason,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Delete Restricted Item
// ==========================================
const deleteRestrictedItem = async (req, res) => {
  try {
    const item = await RestrictedItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Restricted item not found.",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Restricted item deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// Update Restricted Item
// ==========================================
const updateRestrictedItem = async (req, res) => {
  try {
    const { name, category, reason } = req.body;

    const item = await RestrictedItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Restricted item not found.",
      });
    }

    item.name = name || item.name;
    item.category = category || item.category;
    item.reason = reason || item.reason;

    await item.save();

    res.status(200).json({
      success: true,
      message: "Restricted item updated successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getRestrictedItems,
  checkRestrictedItems,
  addRestrictedItem,
  updateRestrictedItem,
  deleteRestrictedItem,
};