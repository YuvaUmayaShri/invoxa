const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'invoiceflow_super_secure_jwt_secret_key_2026_xyz',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide an email and password.', 'Missing credentials', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 'Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Please contact an administrator.', 'Account deactivated', 403);
    }

    const token = generateToken(user._id, user.role);

    // Audit log
    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entity: 'AUTH',
      entityId: user._id.toString(),
      description: `User ${user.name} logged into InvoiceFlow platform successfully`,
      ipAddress: req.ip || '127.0.0.1',
    });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          phone: user.phone,
          vendor: user.vendor,
        },
      },
      'Welcome back!'
    );
  } catch (err) {
    return errorResponse(res, 'Authentication failure.', err.message, 500);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('vendor');
    return successResponse(res, user, 'User profile retrieved');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch user profile.', err.message, 500);
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current and new password are required.', 'Missing fields', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long.', 'Validation error', 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return errorResponse(res, 'Current password entered is incorrect.', 'Password mismatch', 400);
    }

    user.password = newPassword;
    await user.save();

    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'PASSWORD_CHANGED',
      entity: 'AUTH',
      entityId: user._id.toString(),
      description: `User ${user.name} changed their password.`,
    });

    return successResponse(res, {}, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, 'Could not change password.', err.message, 500);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  if (req.user) {
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'LOGOUT',
      entity: 'AUTH',
      entityId: req.user._id.toString(),
      description: `User ${req.user.name} logged out.`,
    });
  }
  return successResponse(res, {}, 'Logged out successfully');
};

module.exports = { login, getMe, changePassword, logout };
