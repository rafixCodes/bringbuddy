const mongoose = require('mongoose');
const RestrictedItem = require('../models/RestrictedItem');
const {
  getRestrictedItemCatalog,
  validateDescriptions,
} = require('../utils/restrictedItemValidator');

const getRestrictedItems = async (req, res) => {
  try {
    const items = await getRestrictedItemCatalog();
    return res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Get restricted items error:', error);
    return res.status(500).json({ success: false, message: 'Could not load restricted items' });
  }
};

const checkRestrictedItems = async (req, res) => {
  try {
    const { descriptions } = req.body;
    const values = Array.isArray(descriptions) ? descriptions : [descriptions];

    if (!values.some((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({
        success: false,
        message: 'At least one item description is required',
      });
    }

    if (values.length > 20 || values.some((value) => String(value).length > 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Too many descriptions or description is too long',
      });
    }

    const validation = await validateDescriptions(values);
    return res.status(200).json({ success: true, ...validation });
  } catch (error) {
    console.error('Check restricted items error:', error);
    return res.status(500).json({ success: false, message: 'Could not validate the item' });
  }
};

const addRestrictedItem = async (req, res) => {
  try {
    const { name, keywords, category, restrictionLevel, reason } = req.body;

    if (!name || !reason || !['prohibited', 'restricted'].includes(restrictionLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Name, reason, and a valid restriction level are required',
      });
    }

    const item = await RestrictedItem.create({
      name,
      keywords: Array.isArray(keywords) ? keywords : [],
      category: category || 'other',
      restrictionLevel,
      reason,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Restricted item rule added successfully',
      item,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A rule with this name already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Add restricted item error:', error);
    return res.status(500).json({ success: false, message: 'Could not add restricted item rule' });
  }
};

const deleteRestrictedItem = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid restricted item ID' });
    }

    const item = await RestrictedItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Restricted item rule not found' });
    }

    return res.status(200).json({ success: true, message: 'Restricted item rule deleted' });
  } catch (error) {
    console.error('Delete restricted item error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete restricted item rule' });
  }
};

module.exports = {
  getRestrictedItems,
  checkRestrictedItems,
  addRestrictedItem,
  deleteRestrictedItem,
};
