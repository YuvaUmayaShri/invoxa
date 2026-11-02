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
      deletedBy: { $ne: userId },
    };

    const rawNotifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);

    const notifications = rawNotifications.map((notif) => {
      const obj = notif.toObject();
      const isReadForUser =
        obj.isRead === true ||
        (Array.isArray(obj.readBy) && obj.readBy.some((id) => id.toString() === userId.toString()));
      obj.isRead = isReadForUser;
      return obj;
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    const userId = req.user._id;
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return errorResponse(res, 'Notification not found.', 'Not found', 404);
    }

    if (!notification.readBy) notification.readBy = [];
    if (!notification.readBy.some((id) => id.toString() === userId.toString())) {
      notification.readBy.push(userId);
    }

    if (notification.user && notification.user.toString() === userId.toString()) {
      notification.isRead = true;
    }

    await notification.save();

    const notifObj = notification.toObject();
    notifObj.isRead = true;

    return successResponse(res, notifObj, 'Notification marked as read');
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
      deletedBy: { $ne: userId },
    };

    await Notification.updateMany(query, {
      $addToSet: { readBy: userId },
    });

    // Also mark direct notifications as isRead
    await Notification.updateMany({ user: userId }, { $set: { isRead: true } });

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
    const userId = req.user._id;
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return errorResponse(res, 'Notification not found.', 'Not found', 404);
    }

    // If it's a private notification for this user, delete completely
    if (notification.user && notification.user.toString() === userId.toString()) {
      await notification.deleteOne();
    } else {
      // If shared notification, hide it for this user without affecting others
      if (!notification.deletedBy) notification.deletedBy = [];
      if (!notification.deletedBy.some((id) => id.toString() === userId.toString())) {
        notification.deletedBy.push(userId);
        await notification.save();
      }
    }

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
