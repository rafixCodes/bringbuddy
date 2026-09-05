const mongoose = require('mongoose');

const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const filter = {
      user: req.user.id,
    };

    if (req.query.unread === 'true') {
      filter.isRead = false;
    }

    const notifications =
      await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(100);

    const unreadCount =
      await Notification.countDocuments({
        user: req.user.id,
        isRead: false,
      });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error(
      'Get notifications error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount =
      await Notification.countDocuments({
        user: req.user.id,
        isRead: false,
      });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      'Get unread notification count error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error(
      'Mark notification as read error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const result =
      await Notification.updateMany(
        {
          user: req.user.id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

    return res.status(200).json({
      success: true,
      message:
        'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      'Mark all notifications as read error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error(
      'Delete notification error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};