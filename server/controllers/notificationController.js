const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    const query = {
      $or: [
        { user: userId },
        { targetRole: 'ALL' },
        { targetRole: userRole },
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    return successResponse(res, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (err) {
    return errorResponse(res, 'Failed to retrieve notifications.', err.message, 500);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return errorResponse(res, 'Notification not found.', 'Not found', 404);
    }

    notification.isRead = true;
    await notification.save();

    return successResponse(res, notification, 'Notification marked as read');
  } catch (err) {
    return errorResponse(res, 'Failed to update notification.', err.message, 500);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    const query = {
      $or: [
        { user: userId },
        { targetRole: 'ALL' },
        { targetRole: userRole },
      ],
      isRead: false,
    };

    await Notification.updateMany(query, { $set: { isRead: true } });

    return successResponse(res, {}, 'All notifications marked as read.');
  } catch (err) {
    return errorResponse(res, 'Failed to mark all as read.', err.message, 500);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return errorResponse(res, 'Notification not found.', 'Not found', 404);
    }

    await notification.deleteOne();
    return successResponse(res, {}, 'Notification deleted successfully');
  } catch (err) {
    return errorResponse(res, 'Failed to delete notification.', err.message, 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
