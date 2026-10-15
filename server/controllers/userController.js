const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('vendor');
    return successResponse(res, users, 'Users retrieved');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch users.', err.message, 500);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found.', 'Not found', 404);
    }

    const { name, phone, department, avatar } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;

    await user.save();

    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'PROFILE_UPDATED',
      entity: 'AUTH',
      entityId: user._id.toString(),
      description: `User ${user.name} updated their profile settings.`,
    });

    const updated = await User.findById(user._id).select('-password');
    return successResponse(res, updated, 'Profile updated successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to update profile.', err.message, 500);
  }
};

module.exports = { getUsers, updateProfile };
