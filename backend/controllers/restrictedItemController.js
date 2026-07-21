const RestrictedItem = require("../models/RestrictedItem");

// Get all restricted items
const getRestrictedItems = async (req, res) => {
  try {
    const items = await RestrictedItem.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Add a restricted item
const createRestrictedItem = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const item = await RestrictedItem.create({
      name,
      description,
      category,
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete a restricted item
const deleteRestrictedItem = async (req, res) => {
  try {
    const item = await RestrictedItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Restricted item not found",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Restricted item deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getRestrictedItems,
  createRestrictedItem,
  deleteRestrictedItem,
};