const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'invoiceflow_super_secure_jwt_secret_key_2026_xyz',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, vendorName, companyName, phone, contactNumber } = req.body;

    // 1. Validate required fields
    if (!name || !name.trim()) {
      return errorResponse(res, 'Please provide your full name.', 'Validation error', 400);
    }
    if (!email || !email.trim()) {
      return errorResponse(res, 'Please provide an email address.', 'Validation error', 400);
    }
    if (!password) {
      return errorResponse(res, 'Please provide a password.', 'Validation error', 400);
    }
    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long.', 'Validation error', 400);
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return errorResponse(res, 'Passwords do not match.', 'Validation error', 400);
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return errorResponse(res, 'Please provide a valid email address.', 'Validation error', 400);
    }

    // 3. Normalize & validate role
    let normalizedRole = 'ACCOUNTS TEAM';
    const roleInput = (role || '').trim().toUpperCase();
    if (roleInput === 'ADMIN' || roleInput === '1') {
      normalizedRole = 'ADMIN';
    } else if (roleInput === 'ACCOUNTS' || roleInput === 'ACCOUNTS TEAM' || roleInput === '2') {
      normalizedRole = 'ACCOUNTS TEAM';
    } else if (roleInput === 'VENDOR' || roleInput === '3') {
      normalizedRole = 'VENDOR';
    } else {
      return errorResponse(res, 'Invalid account type selected. Must be Admin, Accounts Team, or Vendor.', 'Validation error', 400);
    }

    // Security config for demo/production:
    const allowAdminRegistration = process.env.ALLOW_ADMIN_REGISTRATION !== 'false';
    if (normalizedRole === 'ADMIN' && !allowAdminRegistration) {
      return errorResponse(res, 'Administrator self-registration is currently restricted in this environment.', 'Forbidden', 403);
    }

    // 4. Check for existing email in database
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email address already exists. Please log in instead.', 'Duplicate email', 400);
    }

    // 5. Vendor handling
    let vendorIdRef = null;
    let userPhone = (phone || contactNumber || '+91 98000 00000').trim();
    let department = 'Accounts Payable';

    if (normalizedRole === 'ADMIN') {
      department = 'Corporate Administration';
    } else if (normalizedRole === 'ACCOUNTS TEAM') {
      department = 'Accounts Payable Operations';
    } else if (normalizedRole === 'VENDOR') {
      department = 'Billing & Client Relations';
      const cName = (companyName || vendorName || `${name.trim()} Enterprises`).trim();

      // Check if a vendor already exists with this email or company name
      let existingVendor = await Vendor.findOne({
        $or: [
          { email: email.toLowerCase().trim() },
          { companyName: new RegExp(`^${cName}$`, 'i') },
        ],
      });

      if (existingVendor) {
        vendorIdRef = existingVendor._id;
      } else {
        const count = await Vendor.countDocuments();
        const vendorCode = `VND-${String(count + 1).padStart(3, '0')}`;
        const newVendor = await Vendor.create({
          vendorId: vendorCode,
          name: name.trim(),
          companyName: cName,
          email: email.toLowerCase().trim(),
          phone: userPhone,
          status: 'ACTIVE',
        });
        vendorIdRef = newVendor._id;
      }
    }

    // 6. Create User document
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Password is automatically hashed by User schema pre('save') hook
      role: normalizedRole,
      department,
      phone: userPhone,
      vendor: vendorIdRef,
      isActive: true,
    });

    await user.save();

    // 7. Audit log
    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      entity: 'AUTH',
      entityId: user._id.toString(),
      description: `New ${user.role} account registered for ${user.name} (${user.email})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    // 8. Generate JWT token
    const token = generateToken(user._id, user.role);

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
      'Account created successfully! Welcome to INVOXA.',
      201
    );
  } catch (err) {
    return errorResponse(res, 'Failed to create account.', err.message, 500);
  }
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

module.exports = { login, register, getMe, changePassword, logout };
